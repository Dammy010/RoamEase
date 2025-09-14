// Middleware to allow only users with specific roles
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Flatten roles array in case it's passed as an array
    const allowedRoles = roles.flat();
    
    console.log('🔍 RoleMiddleware - User role:', req.user.role);
    console.log('🔍 RoleMiddleware - Allowed roles:', allowedRoles);
    console.log('🔍 RoleMiddleware - Role check:', allowedRoles.includes(req.user.role));

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

module.exports = allowRoles;
