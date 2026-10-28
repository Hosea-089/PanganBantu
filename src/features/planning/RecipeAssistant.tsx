import type { Plan } from './types';
import { Btn } from '@/shared/ui/Btn';
import { MessageCircle, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Source = { id: string; name: string };
type Reply = { answer: string; sources: Source[] };

function parseReply(value: unknown): Reply | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('answer' in value) ||
    typeof value.answer !== 'string' ||
    !value.answer.trim() ||
    value.answer.length > 1600 ||
    !('sources' in value) ||
    !Array.isArray(value.sources) ||
    value.sources.length > 24
  ) {
    return null;
  }
  const sources: Source[] = [];
  for (const source of value.sources) {
    if (
      typeof source !== 'object' ||
      source === null ||
      !('id' in source) ||
      typeof source.id !== 'string' ||
      source.id.length > 64 ||
      !('name' in source) ||
      typeof source.name !== 'string' ||
      source.name.length > 120
    ) {
      return null;
    }
    sources.push({ id: source.id, name: source.name });
  }
  return { answer: value.answer, sources };
}

export function RecipeAssistant({ plan, selectedDay }: { plan: Plan; selectedDay: number }) {
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState<Reply | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt || loading) return;

    setLoading(true);
    setError('');
    setReply(null);
    try {
      const response = await fetch('/api/assistant/recipes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          plan: {
            start: plan.start,
            days: plan.days,
            people: plan.people,
            selectedDay,
            menu: plan.menu,
          },
        }),
      });
      const raw: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof raw === 'object' &&
          raw !== null &&
          'error' in raw &&
          typeof raw.error === 'string' &&
          raw.error.length <= 240
            ? raw.error
            : 'Asisten AI tidak dapat menjawab. Coba lagi.';
        throw new Error(message);
      }
      const parsed = parseReply(raw);
      if (!parsed) throw new Error('Jawaban AI tidak valid. Coba lagi.');
      setReply(parsed);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Koneksi ke asisten AI gagal. Coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="info-box recipe-assistant" aria-labelledby="recipe-assistant-title">
      <h2 id="recipe-assistant-title">
        <MessageCircle size={18} aria-hidden="true" /> Tanya katalog resep
      </h2>
      <p>
        Jawaban memakai katalog resep dan rencana makan aktif. Asisten tidak memeriksa alergi,
        menghitung harga, atau memberi nasihat gizi.
      </p>
      <form onSubmit={ask}>
        <label className="field">
          <span>Pertanyaan tentang resep</span>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={300}
            required
            placeholder="Contoh: Menu makan siang hari kedua apa?"
          />
          <small>
            Maksimal 300 karakter. Pertanyaan dan menu rencana dikirim ke layanan LLM yang
            dikonfigurasi.
          </small>
        </label>
        <Btn type="submit" disabled={loading || !question.trim()}>
          <Send size={15} aria-hidden="true" /> {loading ? 'Menjawab…' : 'Tanya resep'}
        </Btn>
      </form>
      {loading && <p role="status">Asisten sedang mencari resep yang relevan…</p>}
      {error && <p role="alert">{error}</p>}
      {reply && (
        <div className="recipe-assistant-answer" aria-live="polite">
          <h3>Jawaban</h3>
          <p>{reply.answer}</p>
          {reply.sources.length > 0 && (
            <p>
              <strong>Konteks rencana/resep:</strong>{' '}
              {reply.sources.map((source) => source.name).join(' · ')}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
