import pool from "../../config/db.js";
import { db } from "../../config/knex.js";

// fetch requests assigned to a specific staff member
export const fetchStaffRequests = async (staffId) => {
  const result = await pool.query(
    `SELECT 
       r.id, 
       r.status, 
       r.comments,  
       s.name AS service_name, 
       TO_CHAR(r.created_at, 'YYYY-MM-DD HH12:MI AM') AS created_at
     FROM requests r
     JOIN services s ON r.service_id = s.id
     JOIN request_assignments ra ON r.id = ra.request_id
     WHERE ra.staff_id = $1
     ORDER BY r.created_at DESC`,
    [staffId]
  );
  return result.rows;
};

// Dashboard
export const staffDashboard = async (req, res) => {
  try {
    const requests = await fetchStaffRequests(req.user.id);
    res.render("staff/dashboard", { requests, user: req.user });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    req.flash("error_msg", "Failed to load dashboard.");
    res.redirect("/staff/requests");
  }
};

// Route handler to get all requests assigned to staff
export const getStaffRequest = async (req, res) => {
  const userId = req.user.id;
  const { requestId, status, serviceName, startDate, endDate } = req.query;
  try {
    const requests = await fetchStaffRequests(req.user.id);
    let query = db("requests as r")
      .select(
        "r.id",
        "s.name as service_name",
        "s.fee as service_fee",
        "r.status",
        "r.comments",
        "r.created_at"
      )
      .join("services as s", "r.service_id", "s.id")
      .where("r.user_id", userId);

    if (requestId) query = query.where("r.id", requestId);
    if (status) query = query.where("r.status", status);
    if (serviceName) query = query.whereILike("s.name", `%${serviceName}%`);
    if (startDate && endDate)
      query = query.whereBetween("r.created_at", [startDate, endDate]);

    const filterdReqs = await query;
    res.render("staff/requests", { requests, filterdReqs, filters: req.query });
  } catch (err) {
    console.error("Error fetching staff requests:", err);
    req.flash("error_msg", "Failed to load assigned requests.");
    res.redirect("/staff/dashboard");
  }
};

// Add comments to request
