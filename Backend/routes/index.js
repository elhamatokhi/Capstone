import { Router } from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authinticationController.js";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { postContact, getContact } from "../controllers/navBarControllers.js";
import passport from "passport";

const router = Router();

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
  req.logout({ keepSessionInfo: false }, (err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid"); // clear session cookie
      res.redirect("/login"); // go to login page
    });
  });
});

// Google auth routes
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Google OAuth2 Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("Google login successful, user:", req.user);
    res.redirect("/dashboard"); // this must run
  }
);

// About page
router.get(`/about`, (req, res) => {
  res.render(`about`);
});

// Contact page
router.get(`/contact`, getContact);
router.post(`/contact`, postContact);

export default router;
