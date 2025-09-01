import { error } from '../utils/response.js';

export const notFound = (req, res, next) => {
    return error(res, 'Route Not Found', 404);
};
