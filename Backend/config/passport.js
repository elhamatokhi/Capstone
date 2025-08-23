import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import pool from "./db.js";

// Passort strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // use email instead of username
    async (email, password, done) => {
      try {
        const result = await pool.query(
          `SELECT * FROM users WHERE email = $1`,
          [email.toLowerCase()]
        );
        if (result.rows.length === 0) {
          return done(null, false, { message: "Invalid email or Password" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match)
          return done(null, false, { message: "Invalid email or Password" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// checks if the id of the user exists in the DB
passport.deserializeUser(async (id, done) => {
  console.log("deserializeUser called with id:", id);
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) return done(new Error("User not found"));
    console.log("User found:", result.rows[0]);
    return done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

//  Middleware for protecting routes
export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
