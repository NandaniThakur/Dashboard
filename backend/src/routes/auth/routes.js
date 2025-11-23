import express from "express";
import { 
    signIn as signup, 
    Login as login, 
    Logout as logout,
    getAllUsers,
    updateUserRole
} from "../../controllers/auth/controller.js";
import { authenticateToken } from "../../middleware/auth/middleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes - Admin only
router.get("/users", authenticateToken, authorizeRoles('admin', 'admin-sup'), getAllUsers);
router.put("/users/role", authenticateToken, authorizeRoles('admin', 'admin-sup'), updateUserRole);

export default router;
