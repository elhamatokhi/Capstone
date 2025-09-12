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

// Fetch departments with their services and staff
export const fetchDepartments = async () => {
  const result = await pool.query(
    `SELECT 
        d.id AS department_id,
        d.name AS department_name,
        s.id AS service_id,
        s.name AS service_name,
        u.id AS staff_id,
        u.name AS staff_name,
        u.role AS staff_role
      FROM departments d
      LEFT JOIN services s ON s.department_id = d.id
      LEFT JOIN users u ON u.department_id = d.id
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
