import { isValidCode, codeToNumeric, isNumeric } from '../utils/priceCodeMap';

export const addMobile = async (c) => {
    const db = c.env.DB;
    try {
        const { serialNo, purchaseDate, modelName, imei1, imei2, purchaseAmountCode, purchaseAmountNumeric, purchaseAmount, ramRom, seller } = await c.req.json();

        if (!purchaseDate || !modelName || !imei1) {
            return c.json({ success: false, errorType: 'VALIDATION_ERROR', message: 'Please provide all required fields: purchaseDate, modelName, imei1' }, 400);
        }

        let finalCode = null;
        let finalNumeric = null;

        if (purchaseAmountCode !== undefined || purchaseAmountNumeric !== undefined) {
            if (purchaseAmountCode && purchaseAmountCode.trim()) {
                const code = purchaseAmountCode.trim().toUpperCase();
                if (!isValidCode(code)) {
                    return c.json({ success: false, errorType: 'VALIDATION_ERROR', message: `Invalid code "${code}". Valid codes are: Z, Y, X, W, V, U, T, S, R, Q` }, 400);
                }
                finalCode = code;
                finalNumeric = codeToNumeric(code);
            } else if (purchaseAmountNumeric !== undefined && purchaseAmountNumeric !== '') {
                finalNumeric = parseFloat(purchaseAmountNumeric);
            }
        } else if (purchaseAmount !== undefined && purchaseAmount !== '') {
            const value = purchaseAmount.toString().trim();
            if (isNumeric(value)) {
                finalNumeric = parseFloat(value);
            } else if (isValidCode(value)) {
                finalCode = value.toUpperCase();
                finalNumeric = codeToNumeric(value);
            } else {
                return c.json({ success: false, errorType: 'VALIDATION_ERROR', message: `Invalid purchase amount "${value}". Enter a number or valid code (Z, Y, X, W, V, U, T, S, R, Q)` }, 400);
            }
        }

        if (finalNumeric === null || isNaN(finalNumeric)) {
            return c.json({ success: false, errorType: 'VALIDATION_ERROR', message: 'Purchase amount is required' }, 400);
        }

        const existingMobile1 = await db.prepare('SELECT id FROM secondhand_mobiles WHERE imei1 = ?').bind(imei1).first();
        if (existingMobile1) {
            return c.json({ success: false, errorType: 'DUPLICATE_ERROR', message: 'A mobile with this IMEI 1 already exists' }, 400);
        }

        const result = await db.prepare(`
            INSERT INTO secondhand_mobiles (serialNo, purchaseDate, modelName, imei1, imei2, purchaseAmountCode, purchaseAmountNumeric, ramRom, seller, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'IN_STOCK')
            RETURNING *
        `).bind(
            serialNo || null,
            purchaseDate,
            modelName,
            imei1,
            imei2 || '',
            finalCode,
            finalNumeric,
            ramRom || '',
            seller || ''
        ).first();

        return c.json({ success: true, message: 'Mobile added successfully', data: result }, 201);
    } catch (error) {
        return c.json({ success: false, errorType: 'DB_ERROR', message: 'Server error while adding mobile', error: error.message }, 500);
    }
};

export const getAllMobiles = async (c) => {
    const db = c.env.DB;
    const { status, search, sortBy, sortOrder } = c.req.query();

    try {
        let query = 'SELECT * FROM secondhand_mobiles';
        const params = [];
        const conditions = [];

        if (status && ['IN_STOCK', 'SOLD', 'RETURNED', 'RETURNED_TO_SELLER'].includes(status)) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (search) {
            conditions.push('(modelName LIKE ? OR imei1 LIKE ? OR imei2 LIKE ? OR CAST(serialNo AS TEXT) LIKE ?)');
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
        const sortField = sortBy || 'createdAt';
        query += ` ORDER BY ${sortField} ${order}`;

        const { results } = await db.prepare(query).bind(...params).all();

        return c.json({ success: true, count: results.length, data: results });
    } catch (error) {
        return c.json({ success: false, message: 'Server error while fetching mobiles', error: error.message }, 500);
    }
};

export const getMobileById = async (c) => {
    const db = c.env.DB;
    const id = c.req.param('id');
    try {
        const mobile = await db.prepare('SELECT * FROM secondhand_mobiles WHERE id = ?').bind(id).first();
        if (!mobile) return c.json({ success: false, message: 'Mobile not found' }, 404);
        return c.json({ success: true, data: mobile });
    } catch (error) {
        return c.json({ success: false, message: 'Server error', error: error.message }, 500);
    }
};

export const sellMobile = async (c) => {
    const db = c.env.DB;
    const id = c.req.param('id');
    try {
        const { salesDate, salesAmount } = await c.req.json();
        if (!salesDate || salesAmount === undefined) {
            return c.json({ success: false, message: 'Please provide salesDate and salesAmount' }, 400);
        }

        const mobile = await db.prepare('SELECT status FROM secondhand_mobiles WHERE id = ?').bind(id).first();
        if (!mobile) return c.json({ success: false, message: 'Mobile not found' }, 404);
        if (mobile.status === 'SOLD') return c.json({ success: false, message: 'This mobile has already been sold' }, 400);

        const result = await db.prepare(`
            UPDATE secondhand_mobiles SET salesDate = ?, salesAmount = ?, status = 'SOLD'
            WHERE id = ? RETURNING *
        `).bind(salesDate, salesAmount, id).first();

        return c.json({ success: true, message: 'Mobile sold successfully', data: result });
    } catch (error) {
        return c.json({ success: false, message: 'Server error while selling mobile', error: error.message }, 500);
    }
};

export const updateMobile = async (c) => {
    const db = c.env.DB;
    const id = c.req.param('id');
    try {
        const data = await c.req.json();
        const mobile = await db.prepare('SELECT * FROM secondhand_mobiles WHERE id = ?').bind(id).first();
        if (!mobile) return c.json({ success: false, message: 'Mobile not found' }, 404);

        const fields = [];
        const params = [];

        // Standard fields
        for (const [key, value] of Object.entries(data)) {
            if (['serialNo', 'purchaseDate', 'modelName', 'imei1', 'imei2', 'ramRom', 'seller', 'salesDate', 'salesAmount', 'status'].includes(key)) {
                fields.push(`${key} = ?`);
                params.push(value);
            }
        }

        // Handle returned fields
        if (data.returned !== undefined) {
            fields.push('returned = ?');
            params.push(data.returned ? 1 : 0);

            if (data.returned) {
                // When marking as returned, update status and return details
                fields.push('status = ?');
                params.push('RETURNED');

                if (data.returned_customer_name !== undefined) {
                    fields.push('returned_customer_name = ?');
                    params.push(data.returned_customer_name);
                }
                if (data.returned_date !== undefined) {
                    fields.push('returned_date = ?');
                    params.push(data.returned_date);
                }
                if (data.returned_reason !== undefined) {
                    fields.push('returned_reason = ?');
                    params.push(data.returned_reason);
                }
            }
        }

        if (fields.length === 0) return c.json({ success: false, message: 'No valid fields provided for update' }, 400);

        params.push(id);
        const result = await db.prepare(`
            UPDATE secondhand_mobiles SET ${fields.join(', ')} WHERE id = ? RETURNING *
        `).bind(...params).first();

        return c.json({ success: true, message: 'Mobile updated successfully', data: result });
    } catch (error) {
        return c.json({ success: false, message: 'Server error while updating mobile', error: error.message }, 500);
    }
};

export const deleteMobile = async (c) => {
    const db = c.env.DB;
    const id = c.req.param('id');
    try {
        const result = await db.prepare('DELETE FROM secondhand_mobiles WHERE id = ?').bind(id).run();
        if (result.meta.changes === 0) return c.json({ success: false, message: 'Mobile not found' }, 404);
        return c.json({ success: true, message: 'Mobile deleted successfully' });
    } catch (error) {
        return c.json({ success: false, message: 'Server error while deleting mobile', error: error.message }, 500);
    }
};

export const moveToStock = async (c) => {
    const db = c.env.DB;
    const id = c.req.param('id');
    try {
        const mobile = await db.prepare('SELECT * FROM secondhand_mobiles WHERE id = ?').bind(id).first();
        if (!mobile) return c.json({ success: false, message: 'Mobile not found' }, 404);
        if (mobile.status !== 'RETURNED') {
            return c.json({ success: false, message: 'Only returned mobiles can be moved to stock' }, 400);
        }

        const result = await db.prepare(`
            UPDATE secondhand_mobiles SET status = 'IN_STOCK', salesDate = NULL, salesAmount = NULL
            WHERE id = ? RETURNING *
        `).bind(id).first();

        return c.json({ success: true, message: 'Mobile moved to stock successfully', data: result });
    } catch (error) {
        return c.json({ success: false, message: 'Server error', error: error.message }, 500);
    }
};

export const returnToSeller = async (c) => {
    const db = c.env.DB;
    const id = c.req.param('id');
    try {
        const mobile = await db.prepare('SELECT * FROM secondhand_mobiles WHERE id = ?').bind(id).first();
        if (!mobile) return c.json({ success: false, message: 'Mobile not found' }, 404);
        if (mobile.status !== 'RETURNED') {
            return c.json({ success: false, message: 'Only returned mobiles can be returned to seller' }, 400);
        }

        const result = await db.prepare(`
            UPDATE secondhand_mobiles SET status = 'RETURNED_TO_SELLER', returned_to_seller = 1
            WHERE id = ? RETURNING *
        `).bind(id).first();

        return c.json({ success: true, message: 'Mobile returned to seller successfully', data: result });
    } catch (error) {
        return c.json({ success: false, message: 'Server error', error: error.message }, 500);
    }
};
