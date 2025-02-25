require("dotenv").config();
const jwt = require("jsonwebtoken");


function authenticate(allowedRoles = []) {
  return (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(403).json({ message: "No token passed in headers" });
    }

    const token = authorization.slice(7); // Remove 'Bearer ' prefix
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded;

      // If no specific role is required, just authenticate user
      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if the user has a permitted role
      if (allowedRoles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    });
  };
}

module.exports = { authenticate };
