import { error } from '../utils/response.js';

export const validateCustomer = (req, res, next) => {
    const { first_name, last_name, phone_number } = req.body;
    if (!first_name || !last_name || !phone_number) {
        return error(res, 'First name, Last name, and Phone number are required', 400);
    }
    next();
};

export const validateAddress = (req, res, next) => {
    const { address_details, city, state, pin_code } = req.body;
    if (!address_details || !city || !state || !pin_code) {
        return error(res, 'All address fields are required', 400);
    }
    next();
};
