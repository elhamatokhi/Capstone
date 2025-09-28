import passport from "passport";
import pool from "../config/db.js";
import bcrypt from "bcrypt";

const saltRound = 10;

// Register Logic

export const registerUser = async (req, res) => {
  const { name, email, password, gender, date_of_birth, national_id } =
    req.body;
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
      `INSERT INTO users (name, email, password, gender, date_of_birth, national_id) 
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, email, gender, date_of_birth, national_id, created_at, updated_at`,
      [name, email, hash, gender, date_of_birth, national_id]
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
    if (err) {
      console.log("Login error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.log("Login session error:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      // Login successful, return JSON only
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      });
    });
  })(req, res, next);
};
