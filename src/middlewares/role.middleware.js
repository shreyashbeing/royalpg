// import { ROLES } from "../constants/roles.js";

export const studentOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "STUDENT") {
    return res.status(401).json({ message: "Student only" });
  }
  next();
};

export const ownerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "OWNER") {
    return res.status(401).json({ message: "Owner only" });
  }
  next();
};
