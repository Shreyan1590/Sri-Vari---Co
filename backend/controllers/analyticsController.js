const SecondHandMobile = require('../models/SecondHandMobile');

// ========================================
// CIPHER CONVERSION LOGIC
// ========================================
// Explicit dictionary-based lookup - NO index calculations
// 
// Letter → Number mapping:
// Z → 1, Y → 2, X → 3, W → 4, V → 5
// U → 6, T → 7, S → 8, R → 9, Q → 0
//
// Number → Letter mapping (reverse):
// 1 → Z, 2 → Y, 3 → X, 4 → W, 5 → V
// 6 → U, 7 → T, 8 → S, 9 → R, 0 → Q
// ========================================

// Letter to Number mapping (case-insensitive)
const letterToNumber = {
    'Z': '1', 'z': '1',
    'Y': '2', 'y': '2',
    'X': '3', 'x': '3',
    'W': '4', 'w': '4',
    'V': '5', 'v': '5',
    'U': '6', 'u': '6',
    'T': '7', 't': '7',
    'S': '8', 's': '8',
    'R': '9', 'r': '9',
    'Q': '0', 'q': '0'
};

// Number to Letter mapping
const numberToLetter = {
    '1': 'Z',
    '2': 'Y',
    '3': 'X',
    '4': 'W',
    '5': 'V',
    '6': 'U',
    '7': 'T',
    '8': 'S',
    '9': 'R',
    '0': 'Q'
};

/**
 * Decode cipher text to numeric value
 * Converts letters (Z-Q) to numbers using explicit lookup
 * Passes through existing numbers unchanged
 * Skips invalid characters
 * 
 * Test cases:
 * - "ZYX" → 123 (Z=1, Y=2, X=3)
 * - "Y" → 2 (NOT 4, this was the bug)
 * - "ZVQQQ" → 15000 (Z=1, V=5, Q=0, Q=0, Q=0)
 * - "123" → 123 (numbers pass through)
 * - "Z2W" → 124 (Z=1, 2=2, W=4)
 */
const decodeCipher = (text) => {
    if (!text) return 0;
    let decoded = '';
    for (const char of text.toString()) {
        if (letterToNumber[char]) {
            // Convert letter to number using lookup
            decoded += letterToNumber[char];
        } else if (/\d/.test(char)) {
            // Keep existing numbers as-is
            decoded += char;
        }
        // Skip invalid characters (symbols, spaces)
    }
    return parseInt(decoded) || 0;
};

/**
 * Encode numeric value to cipher text
 * Converts numbers to letters using explicit lookup
 * 
 * Test cases:
 * - "123" → "ZYX"
 * - "2" → "Y" (NOT "W")
 * - "15000" → "ZVQQQ"
 */
const encodeCipher = (text) => {
    if (!text) return '';
    let encoded = '';
    for (const char of text.toString()) {
        if (numberToLetter[char]) {
            encoded += numberToLetter[char];
        } else if (letterToNumber[char]) {
            // Already a letter, keep as-is
            encoded += char.toUpperCase();
        }
        // Skip invalid characters
    }
    return encoded;
};

/**
 * @desc    Get dashboard summary
 * @route   GET /api/analytics/summary
 * @access  Private
 */
const getSummary = async (req, res) => {
    try {
        // Get all mobiles
        const mobiles = await SecondHandMobile.find();

        // Calculate statistics
        const totalMobiles = mobiles.length;
        const inStock = mobiles.filter(m => m.status === 'IN_STOCK').length;
        const soldMobiles = mobiles.filter(m => m.status === 'SOLD');
        const sold = soldMobiles.length;

        // Total Investment = Purchase amount of ALL mobiles (decoded from cipher)
        const totalInvestment = mobiles.reduce((sum, m) => sum + decodeCipher(m.purchaseAmount), 0);

        // Total Revenue = Sales amount of SOLD mobiles only
        const totalRevenue = soldMobiles.reduce((sum, m) => sum + (m.salesAmount || 0), 0);

        // Investment on SOLD items only (for accurate profit calculation)
        const soldInvestment = soldMobiles.reduce((sum, m) => sum + decodeCipher(m.purchaseAmount), 0);

        // Profit/Loss = Revenue from SOLD items - Investment on SOLD items
        // This is 100% accurate: only considers completed transactions
        const profitLoss = totalRevenue - soldInvestment;

        res.status(200).json({
            success: true,
            data: {
                totalMobiles,
                inStock,
                sold,
                totalInvestment,
                totalRevenue,
                profitLoss
            }
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching summary',
            error: error.message
        });
    }
};

/**
 * @desc    Get monthly statistics
 * @route   GET /api/analytics/monthly
 * @access  Private
 */
const getMonthlyStats = async (req, res) => {
    try {
        const { year } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        const startDate = new Date(`${selectedYear}-01-01`);
        const endDate = new Date(`${selectedYear}-12-31T23:59:59.999Z`);

        // Fetch all mobiles that were either purchased or sold in the selected year
        const mobiles = await SecondHandMobile.find({
            $or: [
                { purchaseDate: { $gte: startDate, $lte: endDate } },
                { salesDate: { $gte: startDate, $lte: endDate } }
            ]
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map((month, index) => {
            const monthIndex = index + 1;

            // Purchases in this month
            const monthPurchases = mobiles.filter(m =>
                m.purchaseDate &&
                new Date(m.purchaseDate).getFullYear() === selectedYear &&
                new Date(m.purchaseDate).getMonth() + 1 === monthIndex
            );

            // Sales in this month
            const monthSales = mobiles.filter(m =>
                m.status === 'SOLD' &&
                m.salesDate &&
                new Date(m.salesDate).getFullYear() === selectedYear &&
                new Date(m.salesDate).getMonth() + 1 === monthIndex
            );

            const purchaseAmount = monthPurchases.reduce((sum, m) => sum + decodeCipher(m.purchaseAmount), 0);
            const salesAmount = monthSales.reduce((sum, m) => sum + (m.salesAmount || 0), 0);

            // Profit for the month = Sales in month - Cost of items sold in month
            // This is "Accounting Profit" - 100% accurate performance tracking
            const costOfGoodsSold = monthSales.reduce((sum, m) => sum + decodeCipher(m.purchaseAmount), 0);

            return {
                month,
                purchases: monthPurchases.length,
                purchaseAmount,
                sales: monthSales.length,
                salesAmount,
                profit: salesAmount - costOfGoodsSold
            };
        });

        res.status(200).json({
            success: true,
            year: selectedYear,
            data: monthlyData
        });
    } catch (error) {
        console.error('Get monthly stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching monthly statistics',
            error: error.message
        });
    }
};

/**
 * @desc    Get daily statistics
 * @route   GET /api/analytics/daily
 * @access  Private
 */
const getDailyStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const selectedYear = year ? parseInt(year) : now.getFullYear();
        const selectedMonth = month ? parseInt(month) : now.getMonth() + 1;

        // Calculate start and end dates for the selected month
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

        // Fetch all mobiles that were either purchased or sold in the selected month
        const mobiles = await SecondHandMobile.find({
            $or: [
                { purchaseDate: { $gte: startDate, $lte: endDate } },
                { salesDate: { $gte: startDate, $lte: endDate } }
            ]
        });

        const daysInMonth = endDate.getDate();
        const dailyData = [];

        for (let day = 1; day <= daysInMonth; day++) {
            // Purchases on this day
            const dayPurchases = mobiles.filter(m =>
                m.purchaseDate &&
                new Date(m.purchaseDate).getDate() === day &&
                new Date(m.purchaseDate).getMonth() + 1 === selectedMonth
            );

            // Sales on this day
            const daySales = mobiles.filter(m =>
                m.status === 'SOLD' &&
                m.salesDate &&
                new Date(m.salesDate).getDate() === day &&
                new Date(m.salesDate).getMonth() + 1 === selectedMonth
            );

            const purchaseAmount = dayPurchases.reduce((sum, m) => sum + decodeCipher(m.purchaseAmount), 0);
            const salesAmount = daySales.reduce((sum, m) => sum + (m.salesAmount || 0), 0);

            dailyData.push({
                day,
                date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                purchases: dayPurchases.length,
                purchaseAmount,
                sales: daySales.length,
                salesAmount,
                profit: salesAmount - daySales.reduce((sum, m) => sum + decodeCipher(m.purchaseAmount), 0)
            });
        }

        res.status(200).json({
            success: true,
            year: selectedYear,
            month: selectedMonth,
            data: dailyData
        });
    } catch (error) {
        console.error('Get daily stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching daily statistics',
            error: error.message
        });
    }
};

module.exports = {
    getSummary,
    getMonthlyStats,
    getDailyStats
};
