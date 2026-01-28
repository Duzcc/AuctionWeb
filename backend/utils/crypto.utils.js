import argon2 from 'argon2';
import crypto from 'crypto';

/**
 * Hash a plain text string using Argon2id
 * @param {string} plainText 
 * @returns {Promise<string>}
 */
export const hashData = async (plainText) => {
    try {
        return await argon2.hash(plainText, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64 MB
            timeCost: 3,
            parallelism: 1,
        });
    } catch (error) {
        throw new Error('Hashing failed');
    }
};

/**
 * Verify a hash against plain text
 * @param {string} hash 
 * @param {string} plainText 
 * @returns {Promise<boolean>}
 */
export const verifyHash = async (hash, plainText) => {
    try {
        return await argon2.verify(hash, plainText);
    } catch (error) {
        return false;
    }
};

/**
 * Create a SHA256 hash of a string (useful for looking up tokens without storing plain text)
 * @param {string} token 
 * @returns {string}
 */
export const hashTokenFn = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
