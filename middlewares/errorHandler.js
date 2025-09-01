import { error } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error(err.message, err);
    return error(res, err.message || 'Server Error', 500);
};
