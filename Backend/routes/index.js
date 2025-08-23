import { Router } from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authinticationController.js";
import { ensureAuthenticated } from "../config/passport.js";

const router = Router();

// middlware
function requireLogin(req, res, next) {
  if (!req.session?.userId) {
    return res.redirect("/login");
  }
  next();
}

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// GET /register — renders registration form
router.get("/register", (req, res) => {
  res.render("auth", { formType: "register" });
});

// Register user
router.post("/register", registerUser);

// Login user
router.get("/login", (req, res) => {
  res.render("auth", { formType: "login" });
});

// POST login
router.post("/login", loginUser);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

export default router;
