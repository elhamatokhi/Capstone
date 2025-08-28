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
} from "../controllers/dashboard/citizenDashboard.js";
import passport from "passport";
import { upload } from "../middleware/upload.js";
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
router.get("/citizen/request/:serviceId", requestService);

// POST citizen request
router.post(
  "/citizen/request/:serviceId",
  upload.array("documents"),
  ensureAuthenticated,
  submitRequest
);
// GET /citizen/profile View/edit profile

router.get("/citizen/profile", (req, res) => {}); // GET /citizen/services List  available services to apply for

export default router;
