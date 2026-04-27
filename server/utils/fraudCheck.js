const HashTable = require('./HashTable');
const bidCounts = new HashTable(53);

function checkFraud(userId, bidAmount, currentHighest) {
  const now = Date.now();
  const key = userId.toString();
  const userData = bidCounts.get(key) || { count: 0, lastTime: now };

  if (now - userData.lastTime < 60000) {
    userData.count++;
    if (userData.count > 5) {
      bidCounts.set(key, userData);
      return { flagged: true, reason: 'Too many bids in short time' };
    }
  } else {
    userData.count = 1;
    userData.lastTime = now;
  }

  bidCounts.set(key, userData);

  if (currentHighest > 0 && bidAmount > currentHighest * 3) {
    return { flagged: true, reason: 'Suspicious price jump' };
  }

  return { flagged: false, reason: '' };
}

module.exports = checkFraud;