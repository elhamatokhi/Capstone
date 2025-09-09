import pool from "../../config/db.js";
// Fetch all requests
export const fetchRequests = async () => {
  const result = await pool.query(
    `SELECT r.id, r.status, r.comments,to_char(r.created_at, 'YYYY-MM-DD HH12:MI AM') AS created_at,
            s.name AS service_name, u.name AS citizen_name
     FROM requests r
     JOIN services s ON r.service_id = s.id
     JOIN users u ON r.user_id = u.id
     ORDER BY r.created_at DESC`
  );
  return result.rows;
};

// Dashboard
export const adminDashboard = async (req, res) => {
  const user = req.user;
  const requests = await fetchRequests();
  res.render("admin/dashboard", { requests, user });
};
