import express from 'express';
import {
  getAllManpower,
  getManpowerById,
  createManpower,
  updateManpower,
  deleteManpower
} from '../../controllers/manpower/controller.js';
import { authenticateToken } from '../../middleware/auth/middleware.js';
import { authorizeRoles } from '../../middleware/auth/middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes accessible to admin and admin-sup only
router.get('/', authorizeRoles('admin', 'admin-sup'), getAllManpower);
router.get('/:id', authorizeRoles('admin', 'admin-sup'), getManpowerById);
router.post('/', authorizeRoles('admin', 'admin-sup'), createManpower);
router.put('/:id', authorizeRoles('admin', 'admin-sup'), updateManpower);
router.delete('/:id', authorizeRoles('admin', 'admin-sup'), deleteManpower);

export default router;
