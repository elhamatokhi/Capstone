import pool from "../config/db.js";

/* -------------- Profile Controllers --------------- */
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
  res.render("edit", {
    user,
    navbarPartial: `../views/partials/navbar-${req.user.role}`,
  });
};

export const updateProfile = async (req, res) => {
  const { name, email, national_id, date_of_birth } = req.body;
  const userId = req.user.id;

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
