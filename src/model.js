export const ingredients = {
  beras: {
    name: "Beras",
    unit: "g",
    category: "Bahan Pokok",
    price: [14, 17],
    icon: "🌾",
  },
  telur: {
    name: "Telur ayam",
    unit: "butir",
    category: "Protein",
    price: [2200, 2800],
    allergens: ["Telur"],
    icon: "🥚",
  },
  ayam: {
    name: "Daging ayam",
    unit: "g",
    category: "Protein",
    price: [38, 46],
    animal: true,
    icon: "🍗",
  },
  tahu: {
    name: "Tahu putih",
    unit: "g",
    category: "Protein",
    price: [10, 14],
    allergens: ["Kedelai"],
    icon: "◻️",
  },
  tempe: {
    name: "Tempe",
    unit: "g",
    category: "Protein",
    price: [14, 18],
    allergens: ["Kedelai"],
    icon: "🫘",
  },
  wortel: {
    name: "Wortel",
    unit: "g",
    category: "Sayuran",
    price: [12, 16],
    icon: "🥕",
  },
  bayam: {
    name: "Bayam",
    unit: "g",
    category: "Sayuran",
    price: [12, 18],
    icon: "🥬",
  },
  kol: {
    name: "Kol",
    unit: "g",
    category: "Sayuran",
    price: [10, 14],
    icon: "🥬",
  },
  tomat: {
    name: "Tomat",
    unit: "g",
    category: "Sayuran",
    price: [14, 20],
    icon: "🍅",
  },
  kentang: {
    name: "Kentang",
    unit: "g",
    category: "Sayuran",
    price: [17, 22],
    icon: "🥔",
  },
  bawang: {
    name: "Bawang putih",
    unit: "g",
    category: "Bumbu",
    price: [35, 45],
    icon: "🧄",
  },
  merah: {
    name: "Bawang merah",
    unit: "g",
    category: "Bumbu",
    price: [35, 48],
    icon: "🧅",
  },
  minyak: {
    name: "Minyak goreng",
    unit: "ml",
    category: "Bumbu",
    price: [18, 23],
    icon: "🫙",
  },
  garam: {
    name: "Garam",
    unit: "g",
    category: "Bumbu",
    price: [10, 14],
    icon: "🧂",
  },
  kecap: {
    name: "Kecap manis",
    unit: "ml",
    category: "Bumbu",
    price: [35, 45],
    allergens: ["Kedelai", "Gluten"],
    icon: "🫙",
  },
  kunyit: {
    name: "Kunyit",
    unit: "g",
    category: "Bumbu",
    price: [20, 28],
    icon: "🫚",
  },
};

const rice = "/assets/nasi-goreng.webp";
const soup = "/assets/soto-ayam.jpg";

export const recipes = [
  {
    id: "nasi-telur",
    name: "Nasi Goreng Telur",
    slot: 0,
    image: rice,
    time: 20,
    items: {
      beras: 80,
      telur: 1,
      wortel: 40,
      bawang: 5,
      merah: 5,
      minyak: 8,
      kecap: 8,
      garam: 1,
    },
    nutrition: [445, 14, 65, 14, 3],
    steps: [
      "Masak beras hingga menjadi nasi, lalu dinginkan. Cuci dan potong wortel; cincang bawang.",
      "Tumis bawang dengan minyak. Masukkan wortel dan masak sampai empuk.",
      "Tambahkan telur, orak-arik hingga matang, lalu masukkan nasi, kecap, dan garam.",
      "Aduk rata hingga nasi panas merata. Bagi sesuai jumlah porsi.",
    ],
  },
  {
    id: "bubur-sayur",
    name: "Bubur Beras & Sayuran",
    slot: 0,
    image: "/assets/bubur-sayur.jpg",
    time: 30,
    items: { beras: 70, wortel: 60, bayam: 40, bawang: 5, minyak: 5, garam: 1 },
    nutrition: [320, 7, 59, 7, 4],
    steps: [
      "Cuci beras. Rebus dengan air sekitar 6 kali volume beras sambil diaduk hingga menjadi bubur.",
      "Cuci dan potong sayuran. Tumis bawang hingga harum.",
      "Masukkan bawang, wortel, dan garam ke bubur. Masak sampai wortel empuk.",
      "Tambahkan bayam, masak sebentar sampai matang, lalu bagi ke mangkuk.",
    ],
  },
  {
    id: "nasi-tempe",
    name: "Nasi Tumis Tempe Wortel",
    slot: 0,
    image: "/assets/nasi-tempe.jpg",
    time: 20,
    items: { beras: 75, tempe: 80, wortel: 50, bawang: 5, minyak: 8, garam: 1 },
    nutrition: [425, 19, 60, 12, 6],
    steps: [
      "Masak beras hingga matang. Potong tempe dan wortel kecil-kecil.",
      "Tumis bawang dengan minyak. Tambahkan wortel dan sedikit air.",
      "Masukkan tempe dan garam. Aduk dan masak hingga seluruh bahan matang.",
      "Sajikan tumisan bersama nasi sesuai jumlah porsi.",
    ],
  },
  {
    id: "soto",
    name: "Soto Ayam Rumahan",
    slot: 1,
    image: soup,
    time: 35,
    items: {
      beras: 85,
      ayam: 100,
      kol: 60,
      wortel: 40,
      bawang: 6,
      merah: 6,
      kunyit: 5,
      minyak: 5,
      garam: 2,
    },
    nutrition: [480, 27, 68, 11, 4],
    steps: [
      "Masak beras. Rebus ayam hingga matang sempurna, sisihkan kaldu dan suwir ayam.",
      "Haluskan bawang dan kunyit. Tumis dengan minyak hingga harum.",
      "Masukkan bumbu ke kaldu, tambahkan wortel, kol, garam, dan ayam. Rebus sampai sayuran matang.",
      "Bagi soto dan nasi sesuai jumlah porsi. Sajikan hangat.",
    ],
  },
  {
    id: "tahu",
    name: "Tumis Tahu Sayur & Nasi",
    slot: 1,
    image: "/assets/tumis-tahu.jpg",
    time: 25,
    items: {
      beras: 85,
      tahu: 120,
      wortel: 60,
      kol: 60,
      bawang: 6,
      minyak: 8,
      garam: 2,
    },
    nutrition: [425, 17, 65, 12, 5],
    steps: [
      "Masak beras. Cuci sayuran dan potong bersama tahu.",
      "Tumis bawang sampai harum, lalu masukkan wortel dan sedikit air.",
      "Tambahkan kol, tahu, dan garam. Aduk perlahan sampai matang.",
      "Sajikan dengan nasi dan bagi rata sesuai jumlah porsi.",
    ],
  },
  {
    id: "sup-telur",
    name: "Sup Telur Sayuran & Nasi",
    slot: 1,
    image: soup,
    time: 25,
    items: {
      beras: 85,
      telur: 1,
      wortel: 60,
      kol: 60,
      bawang: 5,
      minyak: 5,
      garam: 2,
    },
    nutrition: [415, 13, 66, 11, 4],
    steps: [
      "Masak beras. Cuci dan potong wortel serta kol.",
      "Tumis bawang, tambahkan air, lalu rebus wortel hingga empuk.",
      "Masukkan kol dan telur kocok sedikit demi sedikit. Aduk hingga telur matang.",
      "Beri garam, lalu sajikan dengan nasi sesuai jumlah porsi.",
    ],
  },
  {
    id: "ayam",
    name: "Ayam Kecap & Nasi Hangat",
    slot: 2,
    image: "/assets/ayam-kecap.jpg",
    time: 30,
    items: {
      beras: 85,
      ayam: 100,
      tomat: 60,
      bawang: 6,
      merah: 6,
      kecap: 12,
      minyak: 8,
      garam: 1,
    },
    nutrition: [495, 28, 69, 13, 3],
    steps: [
      "Masak beras. Potong ayam dan tomat; iris bawang.",
      "Tumis bawang dengan minyak, lalu masukkan ayam dan aduk hingga berubah warna.",
      "Tambahkan tomat, kecap, garam, dan sedikit air. Tutup dan masak hingga ayam matang sempurna.",
      "Sajikan bersama nasi sesuai jumlah porsi.",
    ],
  },
  {
    id: "tempe-bayam",
    name: "Tempe panggang & sayur bening",
    slot: 2,
    image: "/assets/tempe.jpg",
    time: 25,
    items: {
      beras: 80,
      tempe: 100,
      bayam: 80,
      wortel: 40,
      bawang: 5,
      minyak: 5,
      garam: 2,
    },
    nutrition: [445, 23, 61, 13, 7],
    steps: [
      "Masak beras. Iris tempe, cuci dan potong sayuran.",
      "Oleskan sebagian minyak dan garam pada tempe, lalu panggang di wajan sampai matang di kedua sisi.",
      "Rebus air dengan bawang dan wortel. Tambahkan bayam serta sisa garam, masak sampai matang.",
      "Sajikan nasi, tempe, dan sayur bening sesuai jumlah porsi.",
    ],
  },
  {
    id: "sup-kentang",
    name: "Sup Kentang Sayur & Nasi",
    slot: 2,
    image: "/assets/sup-sayur.jpg",
    time: 30,
    items: {
      beras: 70,
      kentang: 100,
      wortel: 60,
      kol: 60,
      bawang: 5,
      minyak: 5,
      garam: 2,
    },
    nutrition: [380, 8, 74, 6, 6],
    steps: [
      "Masak beras. Kupas kentang, cuci dan potong semua sayuran.",
      "Tumis bawang lalu tambahkan air, kentang, dan wortel. Rebus hingga empuk.",
      "Masukkan kol dan garam. Masak hingga semua sayuran matang.",
      "Bagi sup dan nasi sesuai jumlah porsi, sajikan hangat.",
    ],
  },
];

export const slots = ["Sarapan", "Makan Siang", "Makan Malam"];

export const defaultPrefs = {
  liked: [],
  avoided: [],
  allergies: [],
  diet: "Bebas",
};

export const defaultForm = {
  mode: "Keluarga",
  people: 2,
  days: 3,
  start: "2026-10-12",
  budget: 150000,
};

export const demoStock = {
  beras: 1000,
  telur: 4,
  wortel: 300,
  bawang: 100,
  minyak: 100,
};

export function rupiah(n) {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

export function range(a, b) {
  return `${rupiah(a)}–${rupiah(b)}`;
}

export function qty(n, id) {
  return `${Number(n.toFixed(2)).toLocaleString("id-ID")} ${ingredients[id].unit}`;
}

export function getRecipe(id) {
  return recipes.find((r) => r.id === id);
}

export function allowed(recipe, prefs) {
  return Object.keys(recipe.items).every((id) => {
    const isAvoided = prefs.avoided.includes(id);
    const hasAllergen = (ingredients[id].allergens || []).some((a) =>
      prefs.allergies.includes(a),
    );
    const violatesVegetarian =
      prefs.diet === "Vegetarian" && ingredients[id].animal;
    const violatesVegan =
      prefs.diet === "Vegan" && (ingredients[id].animal || id === "telur");

    return !isAvoided && !hasAllergen && !violatesVegetarian && !violatesVegan;
  });
}

export function calculate(plan, stock = {}) {
  const available = { ...stock };
  const totals = {};
  const meals = [];

  plan.menu.forEach((day, d) => {
    day.forEach((id, s) => {
      const r = getRecipe(id);
      const lines = Object.entries(r.items).map(([key, q]) => {
        const need = q * plan.people;
        const used = Math.min(need, available[key] || 0);
        const buy = need - used;

        available[key] = Math.max(0, (available[key] || 0) - used);

        const [lo, hi] = ingredients[key].price;
        const prev = totals[key]?.buy || 0;
        const line = {
          id: key,
          need,
          used,
          buy,
          min: Math.round((prev + buy) * lo) - Math.round(prev * lo),
          max: Math.round((prev + buy) * hi) - Math.round(prev * hi),
        };

        const t = totals[key] || {
          id: key,
          need: 0,
          used: 0,
          buy: 0,
          min: 0,
          max: 0,
        };

        for (const k of ["need", "used", "buy", "min", "max"]) {
          t[k] += line[k];
        }
        totals[key] = t;

        return line;
      });

      meals.push({
        d,
        s,
        id,
        lines,
        min: lines.reduce((n, l) => n + l.min, 0),
        max: lines.reduce((n, l) => n + l.max, 0),
      });
    });
  });

  const lines = Object.values(totals);
  const min = lines.reduce((n, l) => n + l.min, 0);
  const max = lines.reduce((n, l) => n + l.max, 0);
  const savedMin = lines.reduce(
    (n, l) => n + l.need * ingredients[l.id].price[0] - l.min,
    0,
  );
  const savedMax = lines.reduce(
    (n, l) => n + l.need * ingredients[l.id].price[1] - l.max,
    0,
  );

  return { lines, meals, min, max, savedMin, savedMax };
}

function allocations(n, k) {
  if (k === 1) {
    return [[n]];
  }

  const out = [];
  for (let i = 0; i <= n; i++) {
    for (const rest of allocations(n - i, k - 1)) {
      out.push([i, ...rest]);
    }
  }

  return out;
}

export function generate(form, stock, prefs) {
  const options = [0, 1, 2].map((s) =>
    recipes.filter((r) => r.slot === s && allowed(r, prefs)),
  );

  if (options.some((o) => !o.length)) {
    return { error: "restrictions" };
  }

  const ids = Object.keys(ingredients);
  const vectors = options.map((group) =>
    allocations(form.days, group.length).map((counts) => ({
      counts,
      needs: ids.map((id) =>
        group.reduce(
          (n, r, i) => n + (r.items[id] || 0) * counts[i] * form.people,
          0,
        ),
      ),
    })),
  );

  let best = null;
  let bestMax = Infinity;
  let bestMin = Infinity;

  for (const a of vectors[0]) {
    for (const b of vectors[1]) {
      for (const c of vectors[2]) {
        let max = 0;
        let min = 0;

        for (let i = 0; i < ids.length; i++) {
          const buy = Math.max(
            0,
            a.needs[i] + b.needs[i] + c.needs[i] - (stock[ids[i]] || 0),
          );
          min += Math.round(buy * ingredients[ids[i]].price[0]);
          max += Math.round(buy * ingredients[ids[i]].price[1]);
        }

        if (max < bestMax || (max === bestMax && min < bestMin)) {
          best = [a, b, c];
          bestMax = max;
          bestMin = min;
        }
      }
    }
  }

  const lists = best.map((v, s) =>
    v.counts.flatMap((n, i) => Array(n).fill(options[s][i].id)),
  );

  const cheapest = {
    ...form,
    prefs: structuredClone(prefs),
    menu: Array.from({ length: form.days }, (_, d) =>
      lists.map((list) => list[d]),
    ),
  };

  const sorted = options.map((o) =>
    o
      .slice()
      .sort(
        (a, b) =>
          Object.keys(b.items).filter((id) => prefs.liked.includes(id)).length -
          Object.keys(a.items).filter((id) => prefs.liked.includes(id)).length,
      ),
  );

  const varied = {
    ...form,
    prefs: structuredClone(prefs),
    menu: Array.from({ length: form.days }, (_, d) =>
      sorted.map((o) => o[d % o.length].id),
    ),
  };

  const recommended =
    calculate(varied, stock).max <= form.budget ? varied : cheapest;

  return { plan: recommended, cheapest, feasible: bestMax <= form.budget };
}

export function dateLabel(start, offset = 0, short = false) {
  const d = new Date(start + "T12:00:00");
  d.setDate(d.getDate() + offset);

  return d.toLocaleDateString(
    "id-ID",
    short
      ? { day: "numeric", month: "short" }
      : { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );
}

export function dateRange(plan) {
  const end = new Date(plan.start + "T12:00:00");
  end.setDate(end.getDate() + plan.days - 1);
  const different = end.getFullYear() !== Number(plan.start.slice(0, 4));

  return `${dateLabel(plan.start, 0, true)}${different ? " " + plan.start.slice(0, 4) : ""} – ${dateLabel(plan.start, plan.days - 1, true)} ${end.getFullYear()}`;
}
