function checkSoftClose(auction) {
  const now = Date.now();
  const endTime = new Date(auction.endTime).getTime();
  const twoMinutes = 2 * 60 * 1000;

  if (endTime - now < twoMinutes && endTime > now) {
    auction.endTime = new Date(endTime + twoMinutes);
    return true; // auction was extended
  }
  return false;
}

module.exports = checkSoftClose;