import pool from "../config/db.js";

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.log("Error fetching users: ", err);
    res.status(500).send("Internal Server Error");
  }
};
