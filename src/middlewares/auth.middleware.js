import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const auth = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      // verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // fetch user
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // role check
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied" });
      }

      // 🔥 THIS IS THE MOST IMPORTANT LINE
      req.user = user;

      next();
    } catch (err) {
      console.error("AUTH ERROR:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

export default auth;
