import { getDB } from '../config/db.js';
import { success, error } from '../utils/response.js';
import { getPaginationMeta } from '../utils/pagination.js';
import { logger } from '../utils/logger.js';

// Helper: Check for duplicate customer
const checkDuplicateCustomer = async (db, phone_number) => {
    return await db.get('SELECT * FROM customers WHERE phone_number = ?', [phone_number]);
};

// Helper: Update "Only One Address" flag
const updateSingleAddressFlag = async (db, customerId) => {
    const count = await db.get('SELECT COUNT(*) AS count FROM addresses WHERE customer_id = ?', [customerId]);
    const isSingle = count.count === 1 ? 1 : 0;
    await db.run('UPDATE customers SET only_one_address = ? WHERE id = ?', [isSingle, customerId]);
};

export const createCustomer = async (req, res, next) => {
    try {
        const db = await getDB();
        const { first_name, last_name, phone_number } = req.body;

        if (!first_name || !last_name || !phone_number)
            return error(res, 'First name, last name, and phone number are required', 400);

        const duplicate = await checkDuplicateCustomer(db, phone_number);
        if (duplicate) return error(res, 'Customer with this phone number already exists', 400);

        const result = await db.run(
            'INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)',
            [first_name, last_name, phone_number]
        );

        logger.info(`Customer created: ID ${result.lastID}`);
        success(res, { id: result.lastID }, 'Customer created successfully');
    } catch (err) {
        logger.error(`Error creating customer: ${err.message}`);
        next(err);
    }
};

export const getCustomers = async (req, res, next) => {
    try {
        const db = await getDB();
        const { page = 1, limit = 10, city, state, pin_code, search, sort_by = 'c.id', order = 'ASC' } = req.query;

        let query = `
            SELECT c.*, COUNT(a.id) AS address_count
            FROM customers c
            LEFT JOIN addresses a ON c.id = a.customer_id
        `;
        const params = [];
        const conditions = [];

        if (city) { conditions.push('a.city = ?'); params.push(city); }
        if (state) { conditions.push('a.state = ?'); params.push(state); }
        if (pin_code) { conditions.push('a.pin_code = ?'); params.push(pin_code); }
        if (search) { 
            conditions.push(`(
                c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ? OR
                a.address_details LIKE ? OR a.city LIKE ? OR a.state LIKE ? OR a.pin_code LIKE ?
            )`);
            const term = `%${search}%`;
            params.push(term, term, term, term, term, term, term);
        }

        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
        query += ` GROUP BY c.id ORDER BY ${sort_by} ${order} LIMIT ? OFFSET ?`;
        params.push(Number(limit), (Number(page) - 1) * Number(limit));

        const rows = await db.all(query, params);
        success(res, { data: rows, meta: getPaginationMeta(rows.length, page, limit) });
    } catch (err) {
        logger.error(`Error fetching customers: ${err.message}`);
        next(err);
    }
};

export const getCustomer = async (req, res, next) => {
    try {
        const db = await getDB();
        const { id } = req.params;

        const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
        if (!customer) return error(res, 'Customer not found', 404);

        const addresses = await db.all('SELECT * FROM addresses WHERE customer_id = ?', [id]);
        customer.addresses = addresses;

        success(res, customer);
    } catch (err) {
        logger.error(`Error fetching customer: ${err.message}`);
        next(err);
    }
};


export const updateCustomer = async (req, res, next) => {
    try {
        const db = await getDB();
        const { id } = req.params;
        const { first_name, last_name, phone_number } = req.body;

        if (!first_name || !last_name || !phone_number)
            return error(res, 'First name, last name, and phone number are required', 400);

        const duplicate = await db.get('SELECT * FROM customers WHERE phone_number = ? AND id != ?', [phone_number, id]);
        if (duplicate) return error(res, 'Phone number already used by another customer', 400);

        await db.run(
            'UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?',
            [first_name, last_name, phone_number, id]
        );

        logger.info(`Customer updated: ID ${id}`);
        success(res, null, 'Customer updated successfully');
    } catch (err) {
        logger.error(`Error updating customer: ${err.message}`);
        next(err);
    }
};




export const deleteCustomer = async (req, res, next) => {
    try {
        const db = await getDB();
        const { id } = req.params;

        await db.run('DELETE FROM addresses WHERE customer_id = ?', [id]);
        await db.run('DELETE FROM customers WHERE id = ?', [id]);

        logger.info(`Customer deleted: ID ${id}`);
        success(res, null, 'Customer deleted successfully');
    } catch (err) {
        logger.error(`Error deleting customer: ${err.message}`);
        next(err);
    }
};
