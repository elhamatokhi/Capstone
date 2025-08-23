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
    // res.render("dashboard");
    // res.redirect("/dashboard", { username: user.name });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Loign

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user by email
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];
    console.log("password:", password);
    console.log("user.password:", user.password);

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Wrong password." });
    }

    // save user info to session
    req.session.userId = user.id;
    req.session.name = user.name;

    // ensure session is saved before redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/login");
      }
      res.redirect("/dashboard");
    });

    // Login successful, return user info
    // return res.json({
    //   message: "Logged in successfully.",
    //   user: {
    //     id: user.id,
    //     name: user.name,
    //     email: user.email,
    //     role: user.role,
    //     created_at: user.created_at,
    //   },
    // });
  } catch (error) {
    console.error("Error logging user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
