import { getDB } from '../config/db.js';
import { success, error } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Update "Only One Address" flag
const updateSingleAddressFlag = async (db, customerId) => {
    const count = await db.get('SELECT COUNT(*) AS count FROM addresses WHERE customer_id = ?', [customerId]);
    const isSingle = count.count === 1 ? 1 : 0;
    await db.run('UPDATE customers SET only_one_address = ? WHERE id = ?', [isSingle, customerId]);
};

export const createAddress = async (req, res, next) => {
    try {
        const db = await getDB();
        const { id } = req.params;
        const { address_details, city, state, pin_code, is_primary = 0 } = req.body;

        if (!address_details || !city || !state || !pin_code)
            return error(res, 'All address fields are required', 400);

        const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
        if (!customer) return error(res, 'Customer not found', 404);

        if (is_primary) {
            await db.run('UPDATE addresses SET is_primary = 0 WHERE customer_id = ?', [id]);
        }

        const result = await db.run(
            'INSERT INTO addresses (customer_id, address_details, city, state, pin_code, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
            [id, address_details, city, state, pin_code, is_primary]
        );

        await updateSingleAddressFlag(db, id);

        logger.info(`Address created for customer ${id}: Address ID ${result.lastID}`);
        success(res, { id: result.lastID }, 'Address created successfully');
    } catch (err) {
        logger.error(`Error creating address: ${err.message}`);
        next(err);
    }
};

export const getAddresses = async (req, res, next) => {
    try {
        const db = await getDB();
        const { id } = req.params;

        const rows = await db.all('SELECT * FROM addresses WHERE customer_id = ?', [id]);
        success(res, rows);
    } catch (err) {
        logger.error(`Error fetching addresses: ${err.message}`);
        next(err);
    }
};

export const updateAddress = async (req, res, next) => {
    try {
        const db = await getDB();
        const { addressId } = req.params;
        const { address_details, city, state, pin_code, is_primary } = req.body;

        if (!address_details || !city || !state || !pin_code)
            return error(res, 'All address fields are required', 400);

        if (is_primary) {
            const addr = await db.get('SELECT customer_id FROM addresses WHERE id = ?', [addressId]);
            await db.run('UPDATE addresses SET is_primary = 0 WHERE customer_id = ?', [addr.customer_id]);
        }

        await db.run(
            'UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ?, is_primary = ? WHERE id = ?',
            [address_details, city, state, pin_code, is_primary || 0, addressId]
        );

        const addr = await db.get('SELECT customer_id FROM addresses WHERE id = ?', [addressId]);
        await updateSingleAddressFlag(db, addr.customer_id);

        logger.info(`Address updated: ID ${addressId}`);
        success(res, null, 'Address updated successfully');
    } catch (err) {
        logger.error(`Error updating address: ${err.message}`);
        next(err);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        const db = await getDB();
        const { addressId } = req.params;

        const addr = await db.get('SELECT customer_id FROM addresses WHERE id = ?', [addressId]);
        if (!addr) return error(res, 'Address not found', 404);

        await db.run('DELETE FROM addresses WHERE id = ?', [addressId]);
        await updateSingleAddressFlag(db, addr.customer_id);

        logger.info(`Address deleted: ID ${addressId}`);
        success(res, null, 'Address deleted successfully');
    } catch (err) {
        logger.error(`Error deleting address: ${err.message}`);
        next(err);
    }
};

// Update multiple addresses at once
export const updateMultipleAddresses = async (req, res, next) => {
  try {
    const db = await getDB();
    const { addresses } = req.body;

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ message: 'No addresses provided for update' });
    }

    for (const addr of addresses) {
      const { id: addressId, address_details, city, state, pin_code, is_primary } = addr;

      if (!addressId || !address_details || !city || !state || !pin_code) {
        return res.status(400).json({ message: 'All address fields are required for each address' });
      }

      if (is_primary) {
        const existing = await db.get('SELECT customer_id FROM addresses WHERE id = ?', [addressId]);
        await db.run('UPDATE addresses SET is_primary = 0 WHERE customer_id = ?', [existing.customer_id]);
      }

      await db.run(
        'UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ?, is_primary = ? WHERE id = ?',
        [address_details, city, state, pin_code, is_primary || 0, addressId]
      );
    }

    return res.status(200).json({ message: 'Addresses updated successfully' });
  } catch (err) {
    console.error('Error updating multiple addresses:', err.message);
    next(err);
  }
};




export const addMultipleAddresses = async (req, res, next) => {
  try {
    const db = await getDB();
    const { addresses } = req.body;
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return error(res, 'No addresses provided', 400);
    }

    for (const addr of addresses) {
      const { customer_id, address_details, city, state, pin_code, is_primary } = addr;
      if (!customer_id || !address_details || !city || !state || !pin_code) {
        return error(res, 'All fields required', 400);
      }

      if (is_primary) {
        await db.run('UPDATE addresses SET is_primary = 0 WHERE customer_id = ?', [customer_id]);
      }

      await db.run(
        'INSERT INTO addresses (customer_id, address_details, city, state, pin_code, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
        [customer_id, address_details, city, state, pin_code, is_primary || 0]
      );
    }

    success(res, null, 'Addresses added successfully');
  } catch (err) {
    next(err);
  }
};
