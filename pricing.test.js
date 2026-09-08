const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { promotionPricesFor } = require('./pricing.js');

test('custom promotion prices retain the published rate-3 rules', () => {
  assert.deepEqual(promotionPricesFor(1, 1, 3), { weeklyRegular: 3, weeklyOffer: 0, monthlyRegular: 12, monthlyOffer: 9 });
  assert.deepEqual(promotionPricesFor(2, 2, 3), { weeklyRegular: 6, weeklyOffer: 3, monthlyRegular: 12, monthlyOffer: 9 });
  assert.deepEqual(promotionPricesFor(5, 2, 3), { weeklyRegular: 15, weeklyOffer: 12, monthlyRegular: 48, monthlyOffer: 36 });
});

test('custom promotion prices retain the published rate-4 rules', () => {
  assert.deepEqual(promotionPricesFor(1, 1, 4), { weeklyRegular: 4, weeklyOffer: 0, monthlyRegular: 16, monthlyOffer: 12 });
  assert.deepEqual(promotionPricesFor(5, 2, 4), { weeklyRegular: 20, weeklyOffer: 16, monthlyRegular: 64, monthlyOffer: 48 });
});

test('known official package prices remain unchanged in the catalog', () => {
  const source = readFileSync('script.js', 'utf8');
  assert.match(source, /\['Paquete Matemático', \['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría'\], 18, 15, 60, 45\]/);
  assert.match(source, /\['Paquete Inglés', \['Inglés'\], null, null, 12, 9\]/);
  assert.match(source, /\['Paquete Completo', \[.*?\], 96, 92, 368, 276\]/);
});
