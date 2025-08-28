import passport from "passport";
import pool from "../config/db.js";
import bcrypt, { hash } from "bcrypt";

const saltRound = 10;

// Register Logic

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if the user already exists
    const checkQuery = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    if (checkQuery.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User already exists, please login." });
    }

    // Hash the password asynchronously
    const hash = await bcrypt.hash(password, saltRound);

    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1,$2,$3)
        RETURNING  name, email, created_at, updated_at`,
      [name, email, hash]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Loign

export const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: "Internal server error" });
    if (!user)
      return res
        .status(401)
        .json({ message: info?.message || "Invalid credentials" });

    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      // return res.json({
      //   message: "Login successful",
      //   user: { id: user.id, name: user.name },
      // });
      const role = req.user.role;
      return res.redirect(`${role}/dashboard`);
      // return res.render("dashboard", { user });
    });
  })(req, res, next);
};
