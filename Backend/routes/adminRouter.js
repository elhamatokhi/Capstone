import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
import { adminDashboard } from "../controllers/dashboard/adminDashboard.js";
import { fetchRequests } from "../controllers/dashboard/adminDashboard.js";
const adminRouter = Router();

adminRouter.use(requireRoles("admin"));

adminRouter.get("/dashboard", adminDashboard, getDashboard);

// Get all users

// Get all departments

// Get all requests
adminRouter.get("/requests", fetchRequests);

/* ----------------------------- Admin ROUTES -------------------------- */

export default adminRouter;
