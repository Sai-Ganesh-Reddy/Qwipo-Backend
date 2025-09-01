import { getDB } from '../config/db.js';
import { logger } from '../utils/logger.js';

const seedDatabase = async () => {
    try {
        const db = await getDB();

        await db.run('DELETE FROM addresses');
        await db.run('DELETE FROM customers');

        logger.info('Cleared old data');

        const customers = [
            { first_name: 'John', last_name: 'Doe', phone_number: '9876543210' },
            { first_name: 'Jane', last_name: 'Smith', phone_number: '9123456780' },
            { first_name: 'Alice', last_name: 'Johnson', phone_number: '9988776655' },
        ];

        const customerIds = [];
        for (const c of customers) {
            const result = await db.run(
                'INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)',
                [c.first_name, c.last_name, c.phone_number]
            );
            customerIds.push(result.lastID);
        }

        const addresses = [
            {
                customer_id: customerIds[0],
                address_details: '123 Main St',
                city: 'Mumbai',
                state: 'Maharashtra',
                pin_code: '400001'
            },
            {
                customer_id: customerIds[0],
                address_details: '456 Secondary St',
                city: 'Pune',
                state: 'Maharashtra',
                pin_code: '411001'
            },
            {
                customer_id: customerIds[1],
                address_details: '789 Oak Street',
                city: 'Bengaluru',
                state: 'Karnataka',
                pin_code: '560001'
            },
            {
                customer_id: customerIds[2],
                address_details: '321 Pine Ave',
                city: 'Chennai',
                state: 'Tamil Nadu',
                pin_code: '600001'
            },
        ];

        for (const a of addresses) {
            await db.run(
                'INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)',
                [a.customer_id, a.address_details, a.city, a.state, a.pin_code]
            );
        }

        logger.info('Database seeding completed successfully.');
    } catch (err) {
        logger.error('Error seeding database', err);
    }
};

seedDatabase();
