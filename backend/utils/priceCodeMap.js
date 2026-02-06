/**
 * Price Code Map - Shared mapping between frontend and backend
 * Maps single letter codes to fixed rupee amounts
 */

const PRICE_CODE_MAP = {
    Z: 10000,
    Y: 12000,
    X: 15000,
    W: 18000,
    V: 20000,
    U: 22000,
    T: 25000,
    S: 27000,
    R: 30000,
    Q: 35000
};

// Valid codes list
const VALID_CODES = Object.keys(PRICE_CODE_MAP);

/**
 * Convert code to numeric amount
 * @param {string} code - Single letter code (Z-Q)
 * @returns {number|null} - Numeric amount or null if invalid
 */
const codeToNumeric = (code) => {
    if (!code) return null;
    const upperCode = code.toString().toUpperCase().trim();
    return PRICE_CODE_MAP[upperCode] || null;
};

/**
 * Convert numeric amount to code (reverse lookup)
 * @param {number} amount - Numeric amount
 * @returns {string|null} - Code letter or null if no match
 */
const numericToCode = (amount) => {
    if (!amount) return null;
    const numAmount = parseInt(amount);
    for (const [code, value] of Object.entries(PRICE_CODE_MAP)) {
        if (value === numAmount) return code;
    }
    return null;
};

/**
 * Check if a string is a valid price code
 * @param {string} code - Code to validate
 * @returns {boolean}
 */
const isValidCode = (code) => {
    if (!code) return false;
    return VALID_CODES.includes(code.toString().toUpperCase().trim());
};

/**
 * Check if input is numeric
 * @param {string|number} value - Value to check
 * @returns {boolean}
 */
const isNumeric = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
};

module.exports = {
    PRICE_CODE_MAP,
    VALID_CODES,
    codeToNumeric,
    numericToCode,
    isValidCode,
    isNumeric
};
