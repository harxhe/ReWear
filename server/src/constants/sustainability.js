export const CONDITION_SCORES = {
  'Brand New': {
    impactMultiplier: 0.25,
    weight: 30,
  },
  'Like New': {
    impactMultiplier: 0.55,
    weight: 55,
  },
  'Gently Used': {
    impactMultiplier: 0.8,
    weight: 80,
  },
  Worn: {
    impactMultiplier: 0.95,
    weight: 95,
  },
};

export const ECO_GRADE_THRESHOLDS = [
  { grade: 'A', minScore: 85, tone: 'emerald' },
  { grade: 'B', minScore: 70, tone: 'leaf' },
  { grade: 'C', minScore: 55, tone: 'amber' },
  { grade: 'D', minScore: 40, tone: 'rust' },
  { grade: 'E', minScore: 0, tone: 'red' },
];
