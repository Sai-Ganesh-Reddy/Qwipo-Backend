import express from 'express';
import {
    createCustomer,
    getCustomers,
    getCustomer,
    updateCustomer,
    deleteCustomer
} from '../controllers/customerController.js';
import { validateCustomer } from '../middlewares/validate.js';

const router = express.Router();

router.post('/', validateCustomer, createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', validateCustomer, updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
