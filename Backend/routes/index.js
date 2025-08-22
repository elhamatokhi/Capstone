import { Router } from "express";
import pool from "../config/db.js";
import { getAllUsers } from "../controllers/userController.js";
import {
  registerUser,
  loginUser,
} from "../controllers/authinticationController.js";
const router = Router();

// Get all users
router.get("/", (req, res) => {
  res.send("48 hours of Hardwork and a lifetime pleasure!");
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
router.post("/login", loginUser);
export default router;
