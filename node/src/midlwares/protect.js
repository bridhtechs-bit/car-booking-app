// Protection Middleware
// Verifies JWT token and protects routes requiring authentication

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // LOG 1 : On vérifie ce qui arrive du client
    console.log("--- DEBUG AUTH ---");
    console.log("Headers Auth:", req.headers.authorization);
    console.log("Cookies:", req.cookies?.token);

    if (req.headers.authorization) {
      token = req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.slice(7)
        : req.headers.authorization;
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // LOG 2 : Est-ce qu'on a extrait un token ?
    console.log("Token extrait:", token ? "OUI (commence par " + token.substring(0,10) + "...)" : "NON");

    if (!token) {
      return res.status(401).json({ success: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // LOG 3 : Qu'y a-t-il dans le token ?
    console.log("Payload décodé:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = { id: user._id, _id: user._id, role: user.role, email: user.email, name: user.name };
    next();
  } catch (error) {
    console.error("ERREUR MIDDLEWARE:", error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};

// Admin protection middleware
const adminProtect = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: `Not authorized as admin. Current role: ${req.user.role}`,
    });
  }
};

export { protect, adminProtect };
