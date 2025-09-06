import { Router } from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authinticationController.js";
import { ensureAuthenticated, requireRole } from "../middleware/middleware.js";
import {
  services,
  requestService,
  submitRequest,
  getProfile,
  updateProfile,
  editProfile,
  getHistory,
  deleteRequest,
  paymentSuccess,
  postPayment,
} from "../controllers/dashboard/citizenDashboard.js";
import { postContact, getContact } from "../controllers/navBarControllers.js";
import passport from "passport";
import { upload } from "../middleware/multerConfig.js";
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

/**----------------------ROLES---------------------- */
// Dashboard route
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  const role = req.user.role;
  res.render(`${role}/dashboard`, { user: req.user });
});
/**--------------------------Citizen routes------------------------ */ //

// Citizen Dashboard
router.get("/citizen/dashboard", ensureAuthenticated, services, (req, res) => {
  const role = req.user.role;
  res.render(`${role}/dashboard`, { user: req.user });
});

// Citizen request
router.get("/citizen/request/:serviceId", ensureAuthenticated, requestService);

// POST citizen request
router.post(
  "/citizen/request/:serviceId",
  upload.array("documents", 10),
  ensureAuthenticated,
  submitRequest
);

// DELETE citizen request
router.post("/citizen/delete/:requestId", ensureAuthenticated, deleteRequest);

// GET /citizen/profile
router.get("/citizen/profile", ensureAuthenticated, getProfile);

// edit profile
router.get("/citizen/profile/edit", ensureAuthenticated, editProfile);

// UPDATE profile
router.post("/citizen/profile/edit", ensureAuthenticated, updateProfile);

// History page
router.get("/citizen/history", ensureAuthenticated, getHistory);

// About page
router.get(`/about`, ensureAuthenticated, (req, res) => {
  res.render(`about`);
});

// Contact page
router.get(`/contact`, ensureAuthenticated, getContact);

// Contact form submission
router.post(`/contact`, ensureAuthenticated, postContact);

// FAKE PAYMENT SUCCESS PAGE
// GET fake payment success page
router.get("/citizen/payment-success", paymentSuccess);

// In your fake payment route
router.post("/citizen/pay/:id", postPayment);

/* ----------------------------- STAFF ROUTES -------------------------- */
export default router;
