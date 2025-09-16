import pool from "../../config/db.js";
import { db } from "../../config/knex.js";
//  fetch requests for a specific department
export const fetchRequestsByDepartment = async (departmentId) => {
  const result = await pool.query(
    `SELECT  r.id, r.status, r.comments, 
      s.id AS service_id, 
      to_char(r.created_at, 'YYYY-MM-DD HH24:MI') AS created_at
      FROM requests r
      JOIN services s ON r.service_id = s.id
      WHERE s.department_id = $1`,
    [departmentId]
  );
  return result.rows;
};

// Department Head Dashboard
export const headDashboard = async (req, res) => {
  const user = req.user;
  const requests = await fetchRequestsByDepartment(req.user.department_id);
  console.log(requests);
  res.render("department_head/dashboard", { requests, user });
};

// Get all staff
export const getAllStaff = async (req, res) => {
  const role = req.user.role;
  try {
    const requests = await fetchRequestsByDepartment(req.user.department_id);
    const result = await pool.query(
      `SELECT id, name, email, role FROM users WHERE role ='staff' AND department_id = $1`,
      [req.user.department_id]
    );
    const staffList = result.rows;
    res.render("department_head/staffList", { staff: staffList, requests });
  } catch (error) {
    console.error("Error fetching staff:", error);
    req.flash("error_msg", "Failed to load staff members.");
    res.redirect(`/${role}/dashboard`);
  }
};

// Department requests
export const getRequestsPage = async (req, res) => {
  const departmentId = req.user.department_id;
  const role = req.user.role;
  const { requestId, status, startDate, endDate } = req.query;
  try {
    let query = db("requests as r")
      .select(
        "r.id",
        "r.status",
        "r.comments",
        "s.name as service_name",
        "s.fee as service_fee",
        "s.id as service_id",
        db.raw("to_char(r.created_at, 'YYYY-MM-DD HH24:MI') as created_at")
      )
      .join("services as s", "r.service_id", "s.id")
      .where("s.department_id", departmentId);

    // Fetch staff too - assign request
    const staff = await db("users")
      .select("id", "name")
      .where({ role: "staff", department_id: departmentId });

    if (requestId) query = query.where("r.id", requestId);
    if (status) query = query.where("r.status", status);
    if (startDate && endDate)
      query = query.whereBetween("r.created_at", [startDate, endDate]);

    const requests = await query;
    res.render("department_head/requests", {
      requests,
      staff,
      filters: req.query,
    });
  } catch (error) {
    console.error("Error loading requests:", error);
    req.flash("error_msg", "Failed to load requests.");
    res.redirect(`/${role}/dashboard`);
  }
};

// Assign tasks to staff
export const assignTasksToStaff = async (req, res) => {
  const { requestId, staffId, notes } = req.body;
  const headId = req.user.id; // assuming authentication middleware adds req.user

  try {
    // check if this request is already assigned to this user
    const existing = await pool.query(
      `SELECT * FROM request_assignments WHERE request_id = $1 AND staff_id = $2`,
      [requestId, staffId]
    );

    if (existing.rows.length > 0) {
      req.flash(
        "error_msg",
        "This task is already assigned to the selected staff member."
      );
      return res.redirect("/department_head/requests");
    }

    await pool.query(
      `INSERT INTO request_assignments (request_id, staff_id, assigned_by, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [requestId, staffId, headId, notes]
    );

    req.flash("success_msg", "Task assigned successfully.");
    res.redirect("/department_head/requests");
  } catch (err) {
    console.error("Error assigning task:", err);
    req.flash("error_msg", "Assignment failed. Please try again.");
    res.redirect("/department_head/requests");
  }
};
