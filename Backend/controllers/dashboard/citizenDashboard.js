import pool from "../../config/db.js";

// Dashboard
export const getDashboard = (req, res) => {
  const role = req.user.role;
  const requests = res.locals.requests || []; // get requests from middleware
  res.render(`${role}/dashboard`, { user: req.user, requests });
};

// Services a citizen can request
export const services = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM services`);
    const servicesList = result.rows;

    res.render("citizen/dashboard", { services: servicesList });
  } catch (error) {
    console.log(`Error fetching services: `, error);
    res.status(500).send("Internal server error.");
  }
};

// Get a request
export const requestService = async (req, res) => {
  try {
    const serviceId = parseInt(req.params.serviceId, 10);

    if (isNaN(serviceId)) {
      return res.redirect("/citizen/dashboard");
    }

    const fieldsResult = await pool.query(
      `SELECT name,type,label,required, options FROM service_fields WHERE service_id = $1`,
      [serviceId]
    );

    const fields = fieldsResult.rows;
    res.render("citizen/request", { fields, serviceId });
  } catch (error) {
    console.log(`Error fetching services: `, error);
    res.status(500).send("Internal server error.");
  }
};

// POST a new request
export const submitRequest = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const userId = req.user.id;
    const { note } = req.body;

    // Save request in DB
    const result = await pool.query(
      `INSERT INTO requests (user_id, service_id,comments) VALUES ($1, $2,$3) RETURNING id`,
      [userId, serviceId, note]
    );

    const requestId = result.rows[0].id; //  get request ID

    // Handle dynamic fields
    const ignoreKeys = [
      "serviceId",
      "comments",
      "name",
      "national_id",
      "dob",
      "email",
      "note",
    ];

    const dynamicFields = Object.entries(req.body).filter(
      ([key]) => !ignoreKeys.includes(key)
    );

    for (const [fieldName, value] of dynamicFields) {
      const fieldResult = await pool.query(
        "SELECT id FROM service_fields WHERE service_id = $1 AND name = $2",
        [serviceId, fieldName]
      );

      if (fieldResult.rows.length === 0) continue;

      const fieldId = fieldResult.rows[0].id;

      // Insert into request fields
      await pool.query(
        "INSERT INTO request_fields (request_id, field_id, value) VALUES ($1, $2, $3)",
        [requestId, fieldId, value]
      );
    }

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Map MIME to enum value
        let fileType;
        if (file.mimetype === "application/pdf") {
          fileType = "pdf";
        } else if (file.mimetype === "image/jpeg") {
          fileType = "jpg";
        } else {
          throw new Error(`Unsupported file type: ${file.mimetype}`);
        }

        await pool.query(
          `INSERT INTO documents (request_id, file_path, file_type, uploaded_at)
           VALUES ($1, $2, $3, NOW())`,
          [requestId, file.path, fileType]
        );
      }
    }

    req.flash("success_msg", "Your request was submitted successfully!");
    res.redirect("/citizen/dashboard");
  } catch (err) {
    console.error("Error submitting request:", err);
    res.status(500).send("Something went wrong");
  }
};

// Delete a request
export const deleteRequest = async (req, res) => {
  const requestId = req.params.requestId;
  const userId = req.user.id;
  try {
    // Check if the request exists and belongs to the user
    const result = await pool.query(
      "SELECT * FROM requests WHERE id = $1 AND user_id = $2",
      [requestId, userId]
    );
    if (result.rowCount === 0) {
      req.flash(
        "error_msg",
        "Request not found or you do not have permission to delete it."
      );
      return res.status(404).redirect("/citizen/history");
    }

    // Delete the request
    await pool.query("DELETE FROM requests WHERE id = $1", [requestId]);
    req.flash("success_msg", "Request canceled successfully.");
    res.redirect("/citizen/history");
  } catch (error) {
    console.error("Error deleting request:", error);
    req.flash("error_msg", "Failed to delete request.");
    res.status(500).redirect("/citizen/history");
  }
};

// Setup profile
export const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user details from DB
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    const user = userResult.rows[0];

    // Safely convert to YYYY-MM-DD
    if (user.date_of_birth) {
      user.date_of_birth = user.date_of_birth.toISOString().split("T")[0];
    } else {
      user.date_of_birth = "Enter date of birth";
    }

    res.render(`profile`, {
      user,
      navbarPartial: `../views/partials/navbar-${req.user.role}`,
    });
  } catch (error) {
    console.log("Error", error);
  }
};

// Get edit
export const editProfile = (req, res) => {
  const user = req.user;
  console.log(user);
  res.render("edit", {
    user,
    navbarPartial: `../views/partials/navbar-${req.user.role}`,
  });
};

export const updateProfile = async (req, res) => {
  const { name, email, national_id, date_of_birth } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  const query = `UPDATE users
                 SET name = $1, email = $2, national_id = $3, date_of_birth = $4
                 WHERE id = $5
                 RETURNING *`;

  const values = [name, email, national_id, date_of_birth, userId];

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found." });
    }

    req.flash("success_msg", "Profile updated successfully!");
    res.redirect(`/profile`);
  } catch (error) {
    console.log("Error", error);
    res.status(500).send("Internal Server Error");
  }
};
/* -------------- Citizen History page --------------- */

export const getHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const historyResult = await pool.query(
      `SELECT r.id, s.name AS service_name, s.fee AS service_fee, r.status, r.comments, r.created_at
       FROM requests r
       JOIN services s ON r.service_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    const requests = historyResult.rows;
    res.render("citizen/history", { requests });
  } catch (error) {
    console.log("Error fetching history:", error);
    res.status(500).send("Internal server error.");
  }
};

export const postPayment = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    // Check if request exists and belongs to user
    const requestResult = await pool.query(
      `SELECT r.id, s.name, s.fee
       FROM requests r
       JOIN services s ON r.service_id = s.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [requestId, userId]
    );
    if (requestResult.rows.length === 0) {
      req.flash(
        "error_msg",
        "Request not found or you do not have permission."
      );
      return res.redirect("/citizen/history");
    }

    // Check if payment already exists
    const paymentResult = await pool.query(
      "SELECT * FROM payments WHERE request_id = $1 AND status = 'paid'",
      [requestId]
    );

    if (paymentResult.rows.length > 0) {
      req.flash("error_msg", "This request is already paid.");
      return res.redirect("/citizen/history");
    }

    // Insert payment record
    await pool.query(
      `INSERT INTO payments (request_id, status, amount, paid_at)
       VALUES ($1, $2,$3, NOW())`,
      [requestId, "paid", requestResult.rows[0].fee]
    );

    // Fetch payment info for success page
    const newPaymentResult = await pool.query(
      "SELECT * FROM payments WHERE request_id = $1 AND id = $2 AND status = 'paid' ORDER BY paid_at DESC LIMIT 1",
      [requestId, userId]
    );
    req.session.paymentSuccess = newPaymentResult.rows[0];

    res.redirect("/citizen/payment-success");
  } catch (err) {
    console.error("Error processing payment:", err);
    req.flash("error_msg", "Something went wrong");
    res.redirect("/citizen/history");
  }
};

export const paymentSuccess = (req, res) => {
  const paymentInfo = req.session.paymentSuccess;
  // Clear the session data after reading
  req.session.paymentSuccess = null;

  if (!paymentInfo) {
    req.flash("error_msg", "No payment information found.");
    return res.redirect("/citizen/history");
  }

  res.render("citizen/payment-success", {
    payment: paymentInfo,
    success_msg: ["Payment completed successfully!"],
  });
};
