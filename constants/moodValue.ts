const MOOD_VALUE: any = {
  "Sangat Senang": 5,
  Senang: 4,
  "Biasa Saja": 3,
  Sedih: 2,
  "Sangat Sedih": 1,
};

const VALUE_TO_MOOD: Record<number, string> = {
  5: "Sangat Senang",
  4: "Senang",
  3: "Biasa Saja",
  2: "Sedih",
  1: "Sangat Sedih",
};

export { MOOD_VALUE, VALUE_TO_MOOD };
