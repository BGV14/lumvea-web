const promotionPricesFor = (blocks, courseCount, blockPrice) => {
  const weeklyRegular = blocks * blockPrice;
  const weeklyOffer = weeklyRegular - blockPrice;
  const monthlyBasis = courseCount === 1 ? weeklyRegular : weeklyOffer;
  const monthlyRegular = monthlyBasis * 4;
  const monthlyOffer = monthlyRegular - monthlyBasis;
  return { weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer };
};

if (typeof module !== 'undefined') module.exports = { promotionPricesFor };
