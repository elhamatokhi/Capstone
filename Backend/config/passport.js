import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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
// Passort strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const username = profile.displayName;

        const result = await pool.query(
          `SELECT * FROM users WHERE email = $1`,
          [email]
        );

        if (result.rows.length === 0) {
          // New user - Signup
          console.log("Google Sign up: ", email);
          const insertResult = await pool.query(
            `INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *`,
            [username, email, ""]
          );
          return done(null, insertResult.rows[0]);
        }

        // Returning user = login
        console.log("Google login:", email);
        return done(null, result.rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// checks if the id of the user exists in the DB
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) return done(new Error("User not found"));

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
