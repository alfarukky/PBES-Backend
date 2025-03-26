export const roleMiddleware = (...allowedRoles) => {
  // Validate during middleware creation (fail fast)
  if (allowedRoles.length === 0) {
    throw new Error('At least one role must be specified');
  }

  // Normalize roles once during middleware setup
  const normalizedRoles = new Set(
    allowedRoles.map((role) => role.toLowerCase())
  );

  return (req, res, next) => {
    // 1. Authentication check
    if (!req.user?.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // 2. Authorization check (O(1) lookup)
    if (!normalizedRoles.has(req.user.role.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: `Requires ${[...normalizedRoles].join(' or ')} privileges`,
        allowedRoles: [...normalizedRoles], // Debugging aid
      });
    }

    next();
  };
};

// export const roleMiddleware = (requiredRole) => (req, res, next) => {
//   if (req.user.role === 'SuperAdmin') return next(); // SuperAdmin bypass
//   if (req.user.role === requiredRole) return next(); // Specific role check

//   res.status(403).json({ error: 'Insufficient role privileges' });
// };
