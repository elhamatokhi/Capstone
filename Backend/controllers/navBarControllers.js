import pool from "../config/db.js";

export const getContact = async (req, res) => {
  res.render("contact");
};

export const postContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  const user = req.user;
  const role = user.role;
  console.log(user);
  try {
    const values = [name, email, subject, message];
    const query = `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING id`;
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      req.flash("success_msg", "Your message has been sent successfully!");
      return res.redirect(`${role}/dashboard`);
    } else {
      req.flash("error_msg", "Failed to send your message. Please try again.");
      return res.redirect("/contact");
    }
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
