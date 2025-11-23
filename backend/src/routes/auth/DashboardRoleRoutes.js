import express from 'express';
import { authenticateToken } from '../../middleware/auth/middleware.js';
import { authorizeRoles } from '../../middleware/auth/roleMiddleware.js';

const router = express.Router();

// Example protected route for admin role
router.get('/admin-dashboard', authenticateToken, authorizeRoles('admin'), (req, res) => {
    res.status(200).json({ message: 'Welcome to the admin dashboard!' });
});

// Example protected route for supervisor role
router.get('/supervisor-dashboard', authenticateToken, authorizeRoles('sup'), (req, res) => {
    res.status(200).json({ message: 'Welcome to the supervisor dashboard!' });
});

//Example protected route for admin-auth- super admin  role
router.get('/admin-supervisor-dashboard', authenticateToken, authorizeRoles('admin-sup'), (req, res) => {
    res.status(200).json({ message: 'Welcome to the admin-sup dashboard!' });
}); 



export default router;