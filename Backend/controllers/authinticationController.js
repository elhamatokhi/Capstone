import passport from "passport";
import pool from "../config/db.js";
import bcrypt from "bcrypt";

const saltRound = 10;

// Register Logic

export const registerUser = async (req, res) => {
  const { name, email, password, date_of_birth, national_id } = req.body;
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
      `INSERT INTO users (name, email, password, date_of_birth, national_id) 
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, name, email, date_of_birth, national_id, created_at, updated_at, role`,
      [name, email, hash, date_of_birth, national_id]
    );

    const role = result.rows[0].role;
    const user = result.rows[0];
    req.logIn(user, (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect(`/${role}/dashboard`);
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// // Loign
export const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log("Login error:", err);
      return res.redirect("/login");
    }

    if (!user) {
      req.flash("error_msg", "Invalid email or password.");
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      const role = req.user.role;
      res.redirect(`/${role}/dashboard`);
    });
  })(req, res, next);
};
