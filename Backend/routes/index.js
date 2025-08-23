import { Router } from "express";
import { getAllUsers } from "../controllers/userController.js";
import {
  registerUser,
  loginUser,
} from "../controllers/authinticationController.js";
const router = Router();

// middlware
function requireLogin(req, res, next) {
  if (!req.session?.userId) {
    return res.redirect("/login");
  }
  next();
}

// Dashboard
router.get("/dashboard", requireLogin, (req, res) => {
  console.log("Session username:", req.session.name);
  res.render("dashboard", { username: req.session.name });
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
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

export default router;
