import express from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from '../../controllers/client/controller.js';
import { authenticateToken } from '../../middleware/auth/middleware.js';
import { authorizeRoles } from '../../middleware/auth/middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes accessible to admin and admin-sup only
router.get('/', authorizeRoles('admin', 'admin-sup'), getAllClients);
router.get('/:id', authorizeRoles('admin', 'admin-sup'), getClientById);
router.post('/', authorizeRoles('admin', 'admin-sup'), createClient);
router.put('/:id', authorizeRoles('admin', 'admin-sup'), updateClient);
router.delete('/:id', authorizeRoles('admin', 'admin-sup'), deleteClient);

export default router;
