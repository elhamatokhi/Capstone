import pool from "../../config/db.js";
import { services } from "./citizenDashboard.js";
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

// fetch all users
export const fetchUsers = async () => {
  const result = await pool.query(
    `SELECT u.*, d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id`
  );
  return result.rows;
};

// Get all users
export const getAllUsers = async (req, res) => {
  const users = await fetchUsers();

  res.render("admin/users", { users });
};

// Fetch departments with their services and staff
export const fetchDepartments = async () => {
  const result = await pool.query(
    `SELECT 
        d.id AS department_id,
        d.name AS department_name,
        s.id AS service_id,
        s.name AS service_name,
        s.fee,
        u.id AS staff_id,
        u.name AS staff_name,
        u.email AS staff_email,
        u.role AS staff_role
      FROM departments d
     LEFT JOIN services s 
        ON s.department_id = d.id AND s.is_active = TRUE
     LEFT JOIN users u 
        ON u.department_id = d.id
      ORDER BY d.name, s.name, u.name;
`
  );
  return result.rows;
};

// Get departments

export const getAllDepartments = async (req, res) => {
  try {
    const rows = await fetchDepartments();
    // Group results by department
    const departments = {};
    rows.forEach((row) => {
      if (!departments[row.department_id]) {
        departments[row.department_id] = {
          id: row.department_id,
          name: row.department_name,
          services: [],
          staff: [],
        };
      }

      if (
        row.service_id &&
        !departments[row.department_id].services.some(
          (s) => s.id === row.service_id
        )
      ) {
        departments[row.department_id].services.push({
          id: row.service_id,
          name: row.service_name,
          fee: row.fee,
        });
      }

      if (
        row.staff_id &&
        !departments[row.department_id].staff.some(
          (st) => st.id === row.staff_id
        )
      ) {
        departments[row.department_id].staff.push({
          id: row.staff_id,
          name: row.staff_name,
          role: row.staff_role,
          email: row.staff_email,
        });
      }
    });

    res.render("admin/departments", {
      departments: Object.values(departments),
    });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).send("Server error");
  }
};

// CRUD Services

// Add Service
export const addService = async (req, res) => {
  try {
    const { department_id, name, fee } = req.body;
    await pool.query(
      `INSERT INTO services (department_id,name,fee) 
    VALUES ($1,$2,$3)`,
      [department_id, name, fee]
    );
    req.flash("success_msg", "New service added successfully!");
    res.redirect("/admin/departments");
  } catch (err) {
    console.error("Error adding service:", err);
    res.status(500).send("Something went wrong");
  }
};

// Get edit
export const getEditService = async (req, res) => {
  const serviceId = req.params.id;
  const result = await pool.query(`SELECT * FROM services WHERE id = $1`, [
    serviceId,
  ]);

  if (result.rows.length === 0) {
    req.flash("error_msg", "Service not found");
    return res.redirect("/admin/departments");
  }

  const service = result.rows[0];
  res.render("admin/edit", {
    service,
  });
};

// Edit a service
export const editService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { department_id, name, fee } = req.body;
    await pool.query(
      `UPDATE services
      SET department_id = $1, name = $2, fee = $3
      WHERE id = $4
      RETURNING *`,
      [department_id, name, fee, serviceId]
    );

    req.flash("success_msg", "Service edited successfully!");
    res.redirect("/admin/departments");
  } catch (error) {
    console.error("Error editing service: ", error);
    res.status(500).send("Something went wrong.");
  }
};

// Delete a service
export const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    console.log(serviceId);
    await pool.query(`UPDATE services SET is_active = FALSE WHERE id = $1`, [
      serviceId,
    ]);
    req.flash("success_msg", "Service deleted successfully.");
    res.redirect("/admin/departments");
  } catch (error) {
    console.error("Error deleting service: ", error);
    res.status(500).send("Something went wrong.");
  }
};
