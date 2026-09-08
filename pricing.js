const promotionPricesFor = (blocks, blockPrice, selectedCourseCount = 1) => {
  const weeklyRegular = blocks * blockPrice;
  const weeklyOffer = weeklyRegular - blockPrice;
  const monthlyRegular = selectedCourseCount > 1 ? weeklyOffer * 4 : weeklyRegular * 4;
  const monthlyOffer = selectedCourseCount > 1 ? monthlyRegular - weeklyOffer : monthlyRegular - blockPrice;
  return { weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer };
};

if (typeof module !== 'undefined') module.exports = { promotionPricesFor };
