import pool from "../../config/db.js";

const fetchRequests = async (departmentId) => {
  const result = await pool.query(
    `SELECT r.id, r.status, r.comments, r.created_at,
            s.name AS service_name, u.name AS citizen_name
     FROM requests r
     JOIN services s ON r.service_id = s.id
     JOIN users u ON r.user_id = u.id
     WHERE s.department_id = $1
     ORDER BY r.created_at DESC`,
    [departmentId]
  );
  return result.rows;
};

// Dashboard
export const staffDashboard = async (req, res) => {
  const requests = await fetchRequests(req.user.department_id);
  res.render("staff/dashboard", { requests });
};

// Requests Page
export const getRequestsPage = async (req, res) => {
  const requests = await fetchRequests(req.user.department_id);
  res.render("staff/requests", { requests });
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
