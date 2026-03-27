import { CONDITION_SCORES, ECO_GRADE_THRESHOLDS } from '../constants/sustainability.js';

function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

export function getConditionProfile(conditionLabel) {
  const profile = CONDITION_SCORES[conditionLabel];

  if (!profile) {
    throw new Error(`Unsupported condition label: ${conditionLabel}`);
  }

  return profile;
}

export function getEcoGrade(score) {
  return ECO_GRADE_THRESHOLDS.find(({ minScore }) => score >= minScore)?.grade || 'E';
}

export function calculateSustainabilityMetrics({
  materialBaseValue,
  materialCarbonCostKg,
  materialName,
  materialWaterCostLiters,
  conditionLabel,
}) {
  const conditionProfile = getConditionProfile(conditionLabel);
  const finalScore = materialBaseValue * 0.6 + conditionProfile.weight * 0.4;
  const waterSavedLiters = materialWaterCostLiters * conditionProfile.impactMultiplier;
  const co2DivertedKg = materialCarbonCostKg * conditionProfile.impactMultiplier;

  return {
    conditionLabel,
    conditionWeight: conditionProfile.weight,
    ecoScoreGrade: getEcoGrade(finalScore),
    ecoScoreNumeric: roundToTwo(finalScore),
    impactMultiplier: conditionProfile.impactMultiplier,
    materialName,
    waterSavedLiters: roundToTwo(waterSavedLiters),
    co2DivertedKg: roundToTwo(co2DivertedKg),
  };
}
