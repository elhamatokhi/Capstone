//  Middleware for protecting routes
export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

// For single role
export const requireRole = (role) => (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.redirect("/login");

  if (req.user.role !== role) return res.status(403).send("Forbidden");
  next();
};

// For multiple roles
export const requireRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated())
      return res.redirect("/login");
    if (!roles.includes(req.user.role))
      return res.status(403).send("Forbidden");
    next();
  };
