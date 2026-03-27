import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateSustainabilityMetrics, getConditionProfile, getEcoGrade } from '../src/services/sustainability.service.js';

test('getConditionProfile returns circularity bonus for worn items', () => {
  assert.deepEqual(getConditionProfile('Worn'), {
    impactMultiplier: 0.95,
    weight: 95,
  });
});

test('getEcoGrade maps numeric scores into the expected grade bucket', () => {
  assert.equal(getEcoGrade(89), 'A');
  assert.equal(getEcoGrade(61), 'C');
  assert.equal(getEcoGrade(18), 'E');
});

test('calculateSustainabilityMetrics rewards reused natural fibers', () => {
  const metrics = calculateSustainabilityMetrics({
    materialBaseValue: 72,
    materialCarbonCostKg: 5.9,
    materialName: 'Cotton',
    materialWaterCostLiters: 2700,
    conditionLabel: 'Gently Used',
  });

  assert.equal(metrics.conditionWeight, 80);
  assert.equal(metrics.ecoScoreNumeric, 75.2);
  assert.equal(metrics.ecoScoreGrade, 'B');
  assert.equal(metrics.waterSavedLiters, 2160);
  assert.equal(metrics.co2DivertedKg, 4.72);
});
