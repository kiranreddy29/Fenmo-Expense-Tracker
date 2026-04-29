/**
 * Converts a decimal string (e.g., "123.45") to integer minor units (paise).
 * Uses string manipulation to avoid floating-point precision issues.
 */
export const toMinorUnits = (amountStr) => {
  if (!amountStr || typeof amountStr !== 'string') {
    throw new TypeError(`toMinorUnits expects a non-empty string, got: ${typeof amountStr}`);
  }
  
  const [whole, fraction = ''] = amountStr.split('.');
  const paddedFraction = fraction.padEnd(2, '0').slice(0, 2);
  
  return parseInt(whole || '0', 10) * 100 + parseInt(paddedFraction, 10);
};

/**
 * Converts integer minor units (paise) back to a decimal string (e.g., "123.45").
 */
export const toDisplayString = (minorUnits) => {
  const whole = Math.floor(minorUnits / 100);
  const fraction = (minorUnits % 100).toString().padStart(2, '0');
  return `${whole}.${fraction}`;
};

/**
 * Validates if a string is a valid decimal amount with up to 2 decimal places.
 */
export const isValidAmount = (amountStr) => {
  const regex = /^\d+(\.\d{1,2})?$/;
  if (!regex.test(amountStr)) return false;
  
  const val = parseFloat(amountStr);
  return val > 0;
};
