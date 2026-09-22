// Middleware/auth.js
const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  // 1. Extract the Authorization header
  const authHeader = req.headers.authorization || req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  // 2. Extract the token string from "Bearer <token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: "Access denied. Malformed token." });
  }

  try {
    // 3. Verify using the SAME secret used in your login route
    const jwtSecret = process.env.JWT_SECRET || "fallback_jwt_secret_key";
    const decoded = jwt.verify(token, jwtSecret);

    // 4. Attach the decoded admin payload to req for downstream routes
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = verifyAdmin;
