import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer as createHttpServer, type Server } from 'node:http';
import test from 'node:test';
import {
  createAssistantServer,
  isPlanQuestion,
  normalizeMealPlan,
  retrieveRecipes,
} from '../server/assistant';

type ProviderReply = { choices: { message: { content: string } }[] };
type ProviderRequest = {
  model: string;
  reasoning_effort: string;
  max_completion_tokens: number;
  messages: { role: string; content: string }[];
};

async function withServer<T>(server: Server, run: (baseUrl: string) => Promise<T>): Promise<T> {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Server test gagal bind port.');
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
}

function apiServer(config: { apiUrl?: string; apiKey?: string; model?: string } = {}) {
  return createAssistantServer(config);
}

async function postQuestion(baseUrl: string, question: string, plan?: unknown) {
  return fetch(`${baseUrl}/api/assistant/recipes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(plan === undefined ? { question } : { question, plan }),
  });
}

test('retrieval selects recipes by ingredients, normalizes text and caps context at three', () => {
  const eggRecipes = retrieveRecipes('Apa menu dengan telur?');
  assert.deepEqual(
    eggRecipes.map(({ id }) => id),
    ['nasi-telur', 'sup-telur'],
  );
  assert.equal(retrieveRecipes('Bagaimana cara masak?').length, 0);
  assert.ok(retrieveRecipes('wortel kentang bawang').length <= 3);
});

test('meal-plan context validates slot IDs and resolves day and meal labels', () => {
  const context = normalizeMealPlan({
    start: '2026-10-29',
    days: 2,
    people: 4,
    selectedDay: 0,
    menu: [
      ['nasi-telur', 'tahu', 'ayam'],
      ['bubur-sayur', 'sup-telur', 'tempe-bayam'],
    ],
  });
  assert.ok(context);
  assert.deepEqual(
    context.meals.slice(3, 5).map(({ day, slot, recipe }) => [day + 1, slot, recipe.id]),
    [
      [2, 'Sarapan', 'bubur-sayur'],
      [2, 'Makan Siang', 'sup-telur'],
    ],
  );
  assert.equal(isPlanQuestion('Menu makan siang hari kedua apa?'), true);
  assert.equal(isPlanQuestion('Apa bahan resep telur?'), false);
  assert.equal(
    normalizeMealPlan({
      start: '2026-10-29',
      days: 1,
      people: 2,
      selectedDay: 0,
      menu: [['tahu', 'nasi-telur', 'ayam']],
    }),
    null,
  );
});

test('API validates method, content type, body size, question length and plan context', async () => {
  await withServer(apiServer(), async (baseUrl) => {
    const route = `${baseUrl}/api/assistant/recipes`;
    assert.equal((await fetch(route)).status, 405);
    assert.equal((await fetch(route, { method: 'POST', body: 'question=telur' })).status, 415);
    assert.equal((await postQuestion(baseUrl, ' ')).status, 400);
    assert.equal((await postQuestion(baseUrl, 'telur '.repeat(55))).status, 400);
    const malformed = await fetch(route, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    assert.equal(malformed.status, 400);
    const oversized = await fetch(route, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: 'x'.repeat(5000) }),
    });
    assert.equal(oversized.status, 413);
    assert.equal((await postQuestion(baseUrl, 'Resep telur', {})).status, 400);
  });
});

test('unmatched questions stay local and do not require or call an LLM', async () => {
  await withServer(apiServer(), async (baseUrl) => {
    const response = await postQuestion(baseUrl, 'Apa resep memakai bahan yang tidak ada?');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      answer: 'Belum menemukan resep yang cocok. Sebutkan bahan, misalnya telur, tahu, atau tempe.',
      sources: [],
    });
  });
});

test('plan-only questions reach provider path when valid plan is present', async () => {
  await withServer(apiServer(), async (baseUrl) => {
    const question = 'Menu makan siang hari kedua apa?';
    const plan = {
      start: '2026-10-29',
      days: 2,
      people: 4,
      selectedDay: 0,
      menu: [
        ['nasi-telur', 'tahu', 'ayam'],
        ['bubur-sayur', 'sup-telur', 'tempe-bayam'],
      ],
    };
    const noPlan = await postQuestion(baseUrl, question);
    assert.equal(noPlan.status, 200);
    assert.match((await noPlan.json()).answer, /Belum menemukan resep/);
    const withPlan = await postQuestion(baseUrl, question, plan);
    assert.equal(withPlan.status, 503);
    assert.deepEqual(await withPlan.json(), {
      error: 'Asisten AI belum dikonfigurasi di server.',
    });
  });
});

test('health, diet and price questions are refused without calling an LLM', async () => {
  await withServer(apiServer(), async (baseUrl) => {
    for (const question of ['Apakah resep telur aman untuk alergi?', 'Berapa harga nasi telur?']) {
      const response = await postQuestion(baseUrl, question);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        answer:
          'Asisten ini hanya membantu memahami resep katalog. Asisten tidak menilai alergi, gizi, atau harga; periksa label bahan dan gunakan kalkulasi aplikasi.',
        sources: [],
      });
    }
  });
});

test('missing server credentials fail closed for matched recipes', async () => {
  await withServer(apiServer(), async (baseUrl) => {
    const response = await postQuestion(baseUrl, 'Resep telur');
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Asisten AI belum dikonfigurasi di server.' });
  });
});

test('per-process request limit blocks the eleventh request in one minute', async () => {
  await withServer(apiServer(), async (baseUrl) => {
    for (let i = 0; i < 10; i++) {
      const response = await postQuestion(baseUrl, 'Resep telur');
      assert.equal(response.status, 503);
      await response.arrayBuffer();
    }
    const limited = await postQuestion(baseUrl, 'Resep telur');
    assert.equal(limited.status, 429);
    assert.deepEqual(await limited.json(), {
      error: 'Batas permintaan tercapai. Coba lagi sebentar.',
    });
  });
});

test('retrieved context and server-only key reach provider; client receives grounded sources', async () => {
  let providerPayload: ProviderRequest | undefined;
  let authorization = '';
  const provider = createHttpServer(async (request, response) => {
    let raw = '';
    for await (const chunk of request) raw += chunk;
    providerPayload = JSON.parse(raw) as ProviderRequest;
    authorization = request.headers.authorization ?? '';
    const result: ProviderReply = {
      choices: [{ message: { content: 'Nasi Goreng Telur memakai telur dan wortel.' } }],
    };
    response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(result));
  });

  await withServer(provider, async (providerUrl) => {
    const api = apiServer({
      apiUrl: `${providerUrl}/v1/chat/completions`,
      apiKey: 'test-only-secret',
      model: 'test-model',
    });
    await withServer(api, async (baseUrl) => {
      const response = await postQuestion(baseUrl, 'Apa resep dengan telur?');
      assert.equal(response.status, 200);
      const result = (await response.json()) as { answer: string; sources: { id: string }[] };
      assert.equal(result.answer, 'Nasi Goreng Telur memakai telur dan wortel.');
      assert.deepEqual(
        result.sources.map(({ id }) => id),
        ['nasi-telur', 'sup-telur'],
      );
      assert.equal(JSON.stringify(result).includes('test-only-secret'), false);
      assert.equal(authorization, 'Bearer test-only-secret');

      assert.equal(typeof providerPayload, 'object');
      assert.equal(JSON.stringify(providerPayload).includes('test-only-secret'), false);
      assert.ok(providerPayload);
      assert.equal(providerPayload.model, 'test-model');
      assert.equal(providerPayload.reasoning_effort, 'none');
      assert.equal(providerPayload.max_completion_tokens, 350);
      const messages = providerPayload.messages;
      assert.match(messages[0].content, /Nasi Goreng Telur/);
      assert.match(messages[0].content, /Sup Telur Sayuran & Nasi/);
      assert.doesNotMatch(messages[0].content, /Ayam Kecap & Nasi Hangat/);
      assert.equal(messages[1].content, 'Apa resep dengan telur?');
      assert.equal(messages[1].role, 'user');
    });
  });
});

test('provider failures are sanitized and invalid completions are rejected', async () => {
  const failingProvider = createHttpServer((_request, response) => {
    response.writeHead(429).end('private provider diagnostic');
  });
  await withServer(failingProvider, async (providerUrl) => {
    await withServer(
      apiServer({
        apiUrl: `${providerUrl}/chat/completions`,
        apiKey: 'test-key',
        model: 'test-model',
      }),
      async (baseUrl) => {
        const response = await postQuestion(baseUrl, 'resep telur');
        assert.equal(response.status, 503);
        assert.doesNotMatch(await response.text(), /private provider diagnostic|test-key/);
      },
    );
  });

  const invalidProvider = createHttpServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' }).end('{"choices":[]}');
  });
  await withServer(invalidProvider, async (providerUrl) => {
    await withServer(
      apiServer({
        apiUrl: `${providerUrl}/chat/completions`,
        apiKey: 'test-key',
        model: 'test-model',
      }),
      async (baseUrl) => {
        const response = await postQuestion(baseUrl, 'resep telur');
        assert.equal(response.status, 502);
        assert.deepEqual(await response.json(), { error: 'Jawaban AI tidak valid. Coba lagi.' });
      },
    );
  });
});

test('provider redirects are rejected before credentials can reach another host', async () => {
  let redirected = false;
  const destination = createHttpServer((_request, response) => {
    redirected = true;
    response.writeHead(200).end('{"choices":[]}');
  });
  await withServer(destination, async (destinationUrl) => {
    const provider = createHttpServer((_request, response) => {
      response.writeHead(302, { location: destinationUrl }).end();
    });
    await withServer(provider, async (providerUrl) => {
      await withServer(
        apiServer({
          apiUrl: `${providerUrl}/chat/completions`,
          apiKey: 'test-key',
          model: 'test-model',
        }),
        async (baseUrl) => {
          const response = await postQuestion(baseUrl, 'resep telur');
          assert.equal(response.status, 502);
          assert.equal(redirected, false);
          assert.doesNotMatch(await response.text(), /test-key/);
        },
      );
    });
  });
});

test('provider URL rejects cleartext non-loopback endpoints', () => {
  assert.throws(
    () => createAssistantServer({ apiUrl: 'http://provider.example/v1/chat/completions' }),
    /HTTPS/,
  );
  assert.throws(
    () =>
      createAssistantServer({ apiUrl: 'https://provider.example/v1/chat/completions?key=secret' }),
    /HTTPS/,
  );
});
