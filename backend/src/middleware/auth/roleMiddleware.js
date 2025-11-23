
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {  
            return res.status(403).json({ 
                message: "Access Denied. You do not have the required role.",
                requiredRoles: roles,
                yourRole: req.user?.role || 'none'
            }); 
        }
        next();
    };
}
