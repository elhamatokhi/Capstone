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

export const fetchServices = async () => {
  const result = await pool.query(`SELECT * FROM services`);
  return result.rows;
};

// Dashboard
export const adminDashboard = async (req, res) => {
  const user = req.user;
  const users = await fetchUsers();
  const requests = await fetchRequests();
  const services = await fetchServices();
  res.render("admin/dashboard", { requests, user, users, services });
};

// getAll requests
export const getAllRequests = async (req, res) => {
  const requests = await fetchRequests();
  res.render("admin/requests", { requests });
};
// getAll requests
export const getAllServices = async (req, res) => {
  const services = await fetchServices();
  res.render("admin/services", { services });
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

// POST /admin/departments/:id/head  Assign department head
export const assignDepartmentHead = async (req, res) => {
  const departmentId = req.params.id;
  const { staffId } = req.body;

  try {
    // 1️⃣ Demote current head if any
    await pool.query(
      `UPDATE users SET role = 'staff' WHERE role = 'department_head' AND department_id = $1`,
      [departmentId]
    );

    // 2️⃣ Promote new head
    await pool.query(
      `UPDATE users SET role = 'department_head' WHERE id = $1 AND department_id = $2`,
      [staffId, departmentId]
    );

    req.flash("success_msg", "Department head updated successfully!");
    res.redirect("/admin/departments");
  } catch (err) {
    console.error("Error updating department head:", err);
    req.flash("error_msg", "Failed to update department head.");
    res.redirect("/admin/departments");
  }
};

// POST /admin/staff/:id/department Assign staff to departments
export const assignStaffDepartment = async (req, res) => {
  const staffId = req.params.id;
  const { departmentId } = req.body;

  try {
    await pool.query(
      `UPDATE users SET department_id = $1 WHERE id = $2 AND role = 'staff'`,
      [departmentId, staffId]
    );

    req.flash("success_msg", "Staff assigned to department successfully!");
    res.redirect("/admin/staff");
  } catch (err) {
    console.error("Error assigning staff to department:", err);
    req.flash("error_msg", "Failed to assign staff.");
    res.redirect("/admin/staff");
  }
};

// Get all Staff
export const getAllStaff = async (req, res) => {
  const results = await pool.query(`SELECT * FROM users WHERE role = 'staff'`);

  const staff = results.rows;
  res.render("admin/staff", { staff });
};

// Add staff

export const addStaff = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;
    await pool.query(
      ` INSERT INTO users (name, email, password, role, department_id)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [name, email, password, role, department_id]
    );
    req.flash("success_msg", "New staff added successfully!");
    res.redirect("/admin/staff");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding staff.");
  }
};

// GET EDIT
export const getEditStaff = async (req, res) => {
  const staff_id = req.params.id;
  const result = await pool.query(`SELECT * FROM users WHERE id = $1 `, [
    staff_id,
  ]);

  if (result.rows.length === 0) {
    req.flash("error_msg", "Staff not found");
    return res.redirect("/admin/staff");
  }

  const staff = result.rows[0];
  res.render("admin/editStaff", {
    staff,
  });
};

// Edit staff
export const editStaff = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;
    const staff_id = req.params.id;
    await pool.query(
      `UPDATE users
      SET name = $1, email = $2, password = $3, role = $4, department_id = $5
      WHERE id = $6
      RETURNING *
      `,
      [name, email, password, role, department_id, staff_id]
    );
    req.flash("success_msg", "Staff updated successfully!");
    res.redirect("/admin/staff");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating staff.");
  }
};
// Delete Staff
export const deleteStaff = async (req, res) => {
  try {
    const staff_id = req.params.id;
    await pool.query(`DELETE FROM users WHERE id = $1`, [staff_id]);

    req.flash("success_msg", "staff removed successfully!");
    res.redirect("/admin/staff");
  } catch (err) {
    console.error("Error updating staff:", err);
    req.flash("error_msg", "Failed to update staff.");
    res.redirect("/admin/staff");
  }
};
