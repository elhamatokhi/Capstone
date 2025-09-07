import pool from "../../config/db.js";

// Get all staff

export const getAllStaff = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role FROM users WHERE role ='staff'`
    );
    const staffList = result.rows;
    res.render("department_head/dashboard", { staff: staffList });
  } catch (error) {
    console.error("Error fetching staff:", error);
    req.flash("error_msg", "Failed to load staff members.");
    res.redirect("/admin/dashboard");
  }
};
