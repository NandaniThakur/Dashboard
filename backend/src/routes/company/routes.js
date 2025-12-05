import express from 'express';
import {
  getCompanySettings,
  updateCompanySettings
} from '../../controllers/company/controller.js';
import { authenticateToken } from '../../middleware/auth/middleware.js';
import { authorizeRoles } from '../../middleware/auth/middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Only admin-sup can access company settings
router.get('/', authorizeRoles('admin-sup'), getCompanySettings);
router.put('/', authorizeRoles('admin-sup'), updateCompanySettings);

export default router;
