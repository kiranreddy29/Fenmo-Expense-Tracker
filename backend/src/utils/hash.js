import crypto from 'crypto';

/**
 * Generates a SHA-256 hash of a normalized request body.
 * Normalization ensures that key order doesn't affect the hash.
 */
export const hashRequestBody = (body) => {
  const normalized = JSON.stringify(body, Object.keys(body).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
};
