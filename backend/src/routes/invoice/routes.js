import express from 'express';
import { 
    getAllInvoices, 
    getInvoiceById, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice 
} from '../../controllers/invoice/controller.js';
import { authenticateToken } from '../../middleware/auth/middleware.js';
import { authorizeRoles } from '../../middleware/auth/roleMiddleware.js';

const router = express.Router();

// All routes are protected and only accessible by admin and admin-sup
router.get('/', authenticateToken, authorizeRoles('admin', 'admin-sup'), getAllInvoices);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'admin-sup'), getInvoiceById);
router.post('/', authenticateToken, authorizeRoles('admin', 'admin-sup'), createInvoice);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'admin-sup'), updateInvoice);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'admin-sup'), deleteInvoice);

export default router;
