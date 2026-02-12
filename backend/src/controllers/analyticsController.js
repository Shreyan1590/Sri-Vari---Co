export const getSummary = async (c) => {
    const db = c.env.DB;
    try {
        const { results: mobiles } = await db.prepare('SELECT * FROM secondhand_mobiles').all();

        const totalMobiles = mobiles.length;
        const inStock = mobiles.filter(m => m.status === 'IN_STOCK').length;
        const soldMobiles = mobiles.filter(m => m.status === 'SOLD');
        const sold = soldMobiles.length;

        const totalInvestment = mobiles.reduce((sum, m) => sum + (m.purchaseAmountNumeric || 0), 0);
        const totalRevenue = soldMobiles.reduce((sum, m) => sum + (m.salesAmount || 0), 0);
        const soldInvestment = soldMobiles.reduce((sum, m) => sum + (m.purchaseAmountNumeric || 0), 0);
        const profitLoss = totalRevenue - soldInvestment;

        return c.json({
            success: true,
            data: { totalMobiles, inStock, sold, totalInvestment, totalRevenue, profitLoss }
        });
    } catch (error) {
        return c.json({ success: false, message: 'Server error', error: error.message }, 500);
    }
};

export const getMonthlyStats = async (c) => {
    const db = c.env.DB;
    const { year } = c.req.query();
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    try {
        const { results: mobiles } = await db.prepare(`
            SELECT * FROM secondhand_mobiles 
            WHERE strftime('%Y', purchaseDate) = ? OR strftime('%Y', salesDate) = ?
        `).bind(selectedYear.toString(), selectedYear.toString()).all();

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map((month, index) => {
            const mIndex = index + 1;
            const mStr = mIndex.toString().padStart(2, '0');

            const monthPurchases = mobiles.filter(m => m.purchaseDate && m.purchaseDate.includes(`-${mStr}-`));
            const monthSales = mobiles.filter(m => m.status === 'SOLD' && m.salesDate && m.salesDate.includes(`-${mStr}-`));

            const purchaseAmount = monthPurchases.reduce((sum, m) => sum + (m.purchaseAmountNumeric || 0), 0);
            const salesAmount = monthSales.reduce((sum, m) => sum + (m.salesAmount || 0), 0);
            const costOfGoodsSold = monthSales.reduce((sum, m) => sum + (m.purchaseAmountNumeric || 0), 0);

            return {
                month,
                purchases: monthPurchases.length,
                purchaseAmount,
                sales: monthSales.length,
                salesAmount,
                profit: salesAmount - costOfGoodsSold
            };
        });

        return c.json({ success: true, year: selectedYear, data: monthlyData });
    } catch (error) {
        return c.json({ success: false, message: 'Server error', error: error.message }, 500);
    }
};

export const getDailyStats = async (c) => {
    const db = c.env.DB;
    const { month, year } = c.req.query();
    const now = new Date();
    const sYear = year ? parseInt(year) : now.getFullYear();
    const sMonth = month ? parseInt(month) : now.getMonth() + 1;
    const sMonthStr = sMonth.toString().padStart(2, '0');

    try {
        const { results: mobiles } = await db.prepare(`
            SELECT * FROM secondhand_mobiles 
            WHERE (strftime('%Y', purchaseDate) = ? AND strftime('%m', purchaseDate) = ?)
               OR (strftime('%Y', salesDate) = ? AND strftime('%m', salesDate) = ?)
        `).bind(sYear.toString(), sMonthStr, sYear.toString(), sMonthStr).all();

        const daysInMonth = new Date(sYear, sMonth, 0).getDate();
        const dailyData = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const dStr = day.toString().padStart(2, '0');
            const dateStr = `${sYear}-${sMonthStr}-${dStr}`;

            const dayPurchases = mobiles.filter(m => m.purchaseDate && m.purchaseDate.startsWith(dateStr));
            const daySales = mobiles.filter(m => m.status === 'SOLD' && m.salesDate && m.salesDate.startsWith(dateStr));

            const purchaseAmount = dayPurchases.reduce((sum, m) => sum + (m.purchaseAmountNumeric || 0), 0);
            const salesAmount = daySales.reduce((sum, m) => sum + (m.salesAmount || 0), 0);
            const profit = salesAmount - daySales.reduce((sum, m) => sum + (m.purchaseAmountNumeric || 0), 0);

            dailyData.push({ day, date: dateStr, purchases: dayPurchases.length, purchaseAmount, sales: daySales.length, salesAmount, profit });
        }

        return c.json({ success: true, year: sYear, month: sMonth, data: dailyData });
    } catch (error) {
        return c.json({ success: false, message: 'Server error', error: error.message }, 500);
    }
};
