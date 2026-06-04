const crypto = require('crypto');

/**
 * Generate unique reservation ID
 * Format: RSV-YYYYMMDD-XXXX (e.g., RSV-20260604-A3F7)
 */
const generateReservationId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `RSV-${dateStr}-${randomPart}`;
};

/**
 * Generate a unique waitlist ID
 * Format: WL-YYYYMMDD-XXXX
 */
const generateWaitlistId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `WL-${dateStr}-${randomPart}`;
};

module.exports = { generateReservationId, generateWaitlistId };
