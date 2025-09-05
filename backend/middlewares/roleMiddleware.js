// Middleware to allow only users with specific roles
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Allowed roles: ${roles.join(', ')}` });
    }

    next();
  };
};

module.exports = allowRoles;
