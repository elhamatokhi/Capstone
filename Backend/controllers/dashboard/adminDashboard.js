import pool from "../../config/db.js";
import { fetchRequests } from "./staffDashboardController.js";

// Dashboard
export const adminDashboard = async (req, res) => {
  const user = req.user;
  const requests = await fetchRequests();
  res.render("admin/dashboard", { requests, user });
};
