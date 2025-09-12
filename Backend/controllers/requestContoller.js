import pool from "../config/db.js";
// import { sendEmail } from "../config/mailer.js";

// Update in DB
export const updateStatus = async (status, requestId) => {
  try {
    const result = await pool.query(
      `UPDATE requests
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
      [status, requestId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
};

// Request status change handler
export const changeRequestStatus = async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  try {
    // Update request and return the updated row
    const updatedRequest = await updateStatus(status, requestId);

    // Create a notification for the citizen
    const message = `Your request ${requestId} status changed to: ${status}`;
    await pool.query(
      `INSERT INTO notifications (user_id, message) 
           VALUES ($1, $2)`,
      [updatedRequest.user_id, message]
    );

    // Get the user’s email
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [updatedRequest.user_id]
    );
    const userEmail = userResult.rows[0].email;

    // await sendEmail({
    //   to: userEmail,
    //   subject: "Request status update",
    //   text: `Your request #${requestId} status changed to: ${status}`,
    //   html: `<p>Your request #${requestId} status changed to: ${status}</p>`,
    // });
    req.flash("success_msg", `Request ${status} successfully.`);
    res.redirect(`/requests/${requestId}`);
  } catch (error) {
    console.error("Error changing request status:", error);
    req.flash("error_msg", "Failed to update request status.");
    res.redirect(`/${req.user.role}/requests/${requestId}`);
  }
};

// Fetch request details
export const fetchRequestDetails = async (requestId) => {
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
    return res.redirect("/request/:id");
  }
  return {
    request: result.rows[0],
    documents: docs.rows,
  };
};

// Route handler of Request Details
export const getRequestDetails = async (req, res) => {
  const requestId = req.params.id;
  const role = req.user.role;
  console.log(role);
  try {
    const requests = await fetchRequestDetails(requestId);
    res.render("staff/requestDetails", {
      request: requests.request,
      documents: requests.documents,
      navbarPartial: `../partials/navbar-${req.user.role}`,
    });
  } catch (err) {
    console.error("Error fetching request details:", err);
    req.flash("error_msg", "Failed to load request details.");
    res.redirect("/staff/requests");
  }
};

// Fetch notification
export const fetchNotifications = async (userId) => {
  const result = await pool.query(
    `SELECT id, message, is_read, created_at    
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10`,
    [userId]
  );
  return result.rows;
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.redirect("/citizen/dashboard");
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.redirect("/citizen/dashboard");
  }
};
