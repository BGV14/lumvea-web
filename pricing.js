const promotionPricesFor = (blocks, blockPrice) => {
  const weeklyRegular = blocks * blockPrice;
  const weeklyOffer = weeklyRegular - blockPrice;
  const isMultiBlock = blocks > 1;
  const monthlyRegular = isMultiBlock ? weeklyOffer * 4 : weeklyRegular * 4;
  const monthlyOffer = isMultiBlock ? monthlyRegular - weeklyOffer : monthlyRegular - blockPrice;
  return { weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer };
};

if (typeof module !== 'undefined') module.exports = { promotionPricesFor };
