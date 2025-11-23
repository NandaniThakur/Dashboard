import jwt from "jsonwebtoken";     
export const authenticateToken = (req, res, next) => {
    try {
        const token = req.cookies.token; 
        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token", error: error.message });
    }
};

