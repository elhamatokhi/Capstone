import { Router } from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authinticationController.js";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import {
  postContact,
  getContact,
  getAbout,
} from "../controllers/navBarControllers.js";

import {
  changeRequestStatus,
  getRequestDetails,
} from "../controllers/requestContoller.js";
import {
  editProfile,
  getProfile,
  updateProfile,
} from "../controllers/profilesController.js";
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
    const role = req.user.role;
    res.redirect(`/${role}/dashboard`);
  }
);

router.get("/", (req, res) => {
  res.redirect("/login");
});

// About page
router.get(`/about`, getAbout);

// Contact page
router.get(`/contact`, getContact);
router.post(`/contact`, postContact);

// Shared route with role-based restrictions
router.post(
  "/requests/:id/status",
  requireRoles("department_head", "admin", "staff"),
  changeRequestStatus
);

// Request details page
// router.get("/requests/:id", getRequestDetails);

// Get profile details of all users
router.get("/profile", getProfile);
router.get("/profile/edit", editProfile);
router.post("/profile/edit", updateProfile);

router.get("/success", (req, res) => {
  // Some fake data
  const fakePayment = {
    transactionId: "TXN123456",
    amount: 50.0,
    currency: "USD",
    paymentMethod: "Credit Card",
    date: new Date().toLocaleString(),
    userName: req.user ? req.user.name : "John Doe",
  };
  res.render("citizen/payment-success", { payment: fakePayment });
});
export default router;
