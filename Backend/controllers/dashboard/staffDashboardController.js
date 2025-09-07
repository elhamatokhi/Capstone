import pool from "../../config/db.js";

export const requests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.status, r.service_id,r.comments, r.created_at, s.name AS service_name, u.name AS citizen_name
       FROM requests r
       JOIN services s ON r.service_id = s.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    req.requests = result.rows;
    res.render("staff/dashboard", { requests: req.requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    req.flash("error_msg", "Failed to load requests.");
    res.redirect("/dashboard");
  }
};
