const promotionPricesFor = (blocks, blockPrice) => {
  const weeklyRegular = blocks * blockPrice;
  const weeklyOffer = weeklyRegular - blockPrice;
  const monthlyRegular = weeklyRegular * 4;
  const monthlyOffer = monthlyRegular - blockPrice;
  return { weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer };
};

if (typeof module !== 'undefined') module.exports = { promotionPricesFor };
