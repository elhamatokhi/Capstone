import pool from "../../config/db.js";

export const requests = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    // Fetch requests for services in the staff member's department only
    const result = await pool.query(
      `SELECT r.id, r.status, r.comments,
       s.name AS service_name,
       u.name AS citizen_name
      FROM requests r
      JOIN services s ON r.service_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE s.department_id = $1
      ORDER BY r.created_at DESC;`,
      [departmentId]
    );
    req.requests = result.rows;
    res.render("staff/dashboard", { requests: req.requests, user: req.user });
  } catch (error) {
    console.error("Error fetching requests:", error);
    req.flash("error_msg", "Failed to load requests.");
    res.redirect("/dashboard");
  }
};
