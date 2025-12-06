import { User } from "../../models/user/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


//signup
export const signIn = async (req, res) => {
    try {
        console.log("Signup request received:", req.body);
        
        const { firstName, lastName, email, password, role } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ 
                message: "All fields are required" 
            });
        }
        
        // Validate role if provided
        const validRoles = ['sup', 'admin', 'admin-sup'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ 
                message: "Invalid role. Must be one of: sup, admin, admin-sup" 
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: "User with this email already exists" 
            });
        }
        
        // Create user with specified role or use schema default (sup)
        const userData = { 
            firstName, 
            lastName, 
            email, 
            password
        };
        
        // Only add role if explicitly provided
        if (role) {
            userData.role = role;
        }
        
        const user = await User.create(userData);
        console.log("User created successfully:", user.email, "with role:", user.role);
        
        res.status(201).json({ 
            message: "User created successfully", 
            user: { 
                id: user._id, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email,
                role: user.role
            } 
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }       
};    


///login
export const Login = async(req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const isPasswordValid=await bcrypt.compare(req.body.password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid password"});
        }

        // Create JWT token with user ID and role
        // Set different session times based on role
        let sessionDuration;
        switch(user.role) {
            case 'admin-sup':
                sessionDuration = "24h"; // Admin-Supervisor: 24 hours
                break;
            case 'admin':
                sessionDuration = "12h"; // Admin: 12 hours
                break;
            case 'sup':
                sessionDuration = "30m"; // Supervisor: 30 minutes
                break;
            default:
                sessionDuration = "30m";
        }
        
        const token=jwt.sign(
            {id:user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: sessionDuration}
        );
        
        res.cookie("token",token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:"Strict"
        });
        
        res.status(200).json({
            message:"Login successful",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({message:"Internal server error",error:error.message});
    }
};



//logout 
export const Logout = (req,res)=>{
    res.clearCookie("token");
    res.status(200).json({message:"Logout successful"});
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            message: "Users retrieved successfully",
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({message: "Error fetching users", error: error.message});
    }
};

// Update user role (Admin/Admin-sup only)
export const updateUserRole = async (req, res) => {
    try {
        const { userId, newRole } = req.body;
        
        if (!userId || !newRole) {
            return res.status(400).json({ message: "userId and newRole are required" });
        }
        
        const validRoles = ['sup', 'admin', 'admin-sup'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ 
                message: "Invalid role. Must be one of: sup, admin, admin-sup" 
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId, 
            { role: newRole }, 
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ 
            message: "Role updated successfully", 
            user 
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating role", error: error.message });
    }
};



// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error("🔥 DELETE USER ERROR");
        console.error("ID:", req.params.id);
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        console.error("Full Error:", error);
        res.status(500).json({ 
            message: 'Error deleting user', 
            error: error.message 
        });
    }
};

