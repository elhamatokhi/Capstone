import pool from "../../config/db.js";

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
    const serviceId = req.params.serviceId;

    if (!serviceId) {
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

    // 1️⃣ Save request in DB
    const result = await pool.query(
      `INSERT INTO requests (user_id, service_id,comments) VALUES ($1, $2,$3) RETURNING id`,
      [userId, serviceId, note]
    );

    const requestId = result.rows[0].id; // ✅ fix: get request ID
    console.log("Request ID:", requestId);

    // 2️⃣ Handle dynamic fields
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

      await pool.query(
        "INSERT INTO request_fields (request_id, field_id, value) VALUES ($1, $2, $3)",
        [requestId, fieldId, value]
      );
    }

    res.redirect("/citizen/dashboard");
  } catch (err) {
    console.error("Error submitting request:", err);
    res.status(500).send("Something went wrong");
  }
};
