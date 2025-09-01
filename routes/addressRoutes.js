import express from 'express';
import {
    createAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    updateMultipleAddresses,
    addMultipleAddresses
} from '../controllers/addressController.js';
import { validateAddress } from '../middlewares/validate.js';

const router = express.Router();

router.post('/:id/addresses', validateAddress, createAddress);
router.get('/:id/addresses', getAddresses);
router.put('/:addressId', validateAddress, updateAddress);
router.delete('/:addressId', deleteAddress);
router.put('/multiple', updateMultipleAddresses);
router.post('/multiple', addMultipleAddresses);

export default router;
