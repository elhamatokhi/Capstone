import pool from "../../config/db.js";

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

// Requests Page
export const getStaffRequest = async (req, res) => {
  try {
    const requests = await fetchStaffRequests(req.user.id);
    res.render("staff/requests", { requests });
  } catch (err) {
    console.error("Error fetching staff requests:", err);
    req.flash("error_msg", "Failed to load assigned requests.");
    res.redirect("/staff/dashboard");
  }
};

// Fetch all requests for
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

// Request Details
export const getRequestDetails = async (req, res) => {
  const requestId = req.params.id;
  console.log("Fetching details for request ID:", requestId);
  try {
    const result = await pool.query(
      `SELECT r.id, r.status, r.comments, r.created_at,
              s.name AS service_name,
              u.name AS citizen_name, u.email AS citizen_email, u.national_id
       FROM requests r
       JOIN services s ON r.service_id = s.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [requestId]
    );

    const docs = await pool.query(
      `SELECT file_type, file_path
       FROM documents
       WHERE request_id = $1`,
      [requestId]
    );

    if (result.rows.length === 0) {
      req.flash("error_msg", "Request not found.");
      return res.redirect("/staff/requests");
    }

    res.render("staff/requestDetails", {
      request: result.rows[0],
      documents: docs.rows,
    });
  } catch (err) {
    console.error("Error fetching request details:", err);
    req.flash("error_msg", "Failed to load request details.");
    res.redirect("/staff/requests");
  }
};
