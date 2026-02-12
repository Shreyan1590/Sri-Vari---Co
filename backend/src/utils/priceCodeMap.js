/**
 * Price Code Map - Shared mapping between frontend and backend
 * Maps single letter codes to fixed rupee amounts
 */

export const PRICE_CODE_MAP = {
    Z: '1',
    Y: '2',
    X: '3',
    W: '4',
    V: '5',
    U: '6',
    T: '7',
    S: '8',
    R: '9',
    Q: '0'
};

// Valid codes list
export const VALID_CODES = Object.keys(PRICE_CODE_MAP);

/**
 * Convert cipher string to numeric amount
 * @param {string} cipher - Cipher string (e.g., "ZVQQQ")
 * @returns {number|null} - Numeric amount or null if invalid
 */
export const codeToNumeric = (cipher) => {
    if (!cipher) return null;
    const upperCipher = cipher.toString().toUpperCase().trim();
    let decodedValue = '';

    for (const char of upperCipher) {
        if (PRICE_CODE_MAP[char]) {
            decodedValue += PRICE_CODE_MAP[char];
        } else {
            // If any character is not in the map, it's an invalid cipher
            return null;
        }
    }

    const amount = parseInt(decodedValue);
    return isNaN(amount) ? null : amount;
};

/**
 * Convert numeric amount to cipher string
 * @param {number} amount - Numeric amount
 * @returns {string|null} - Cipher string or null
 */
export const numericToCode = (amount) => {
    if (amount === null || amount === undefined) return null;
    const strAmount = amount.toString();
    let encoded = '';

    // Reverse map for lookup
    const reverseMap = {};
    for (const [key, val] of Object.entries(PRICE_CODE_MAP)) {
        reverseMap[val] = key;
    }

    for (const digit of strAmount) {
        if (reverseMap[digit]) {
            encoded += reverseMap[digit];
        } else {
            return null; // Should not happen with clean numeric data
        }
    }
    return encoded;
};

/**
 * Check if a string is a valid price code (entirely made of mapping letters)
 * @param {string} code - Code to validate
 * @returns {boolean}
 */
export const isValidCode = (code) => {
    if (!code) return false;
    const upperCode = code.toString().toUpperCase().trim();
    for (const char of upperCode) {
        if (!PRICE_CODE_MAP[char]) return false;
    }
    return true;
};

/**
 * Check if input is numeric
 * @param {string|number} value - Value to check
 * @returns {boolean}
 */
export const isNumeric = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
};
