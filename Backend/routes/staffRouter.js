import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
import {
  getRequestsPage,
  staffDashboard,
  getRequestDetails,
} from "../controllers/dashboard/staffDashboardController.js";

const staffRouter = Router();
staffRouter.use(requireRoles("staff"));

/**--------------------------Citizen routes------------------------ */ //

// Staff Dashboard
staffRouter.get("/dashboard", staffDashboard, getDashboard);

// Citizen requests
staffRouter.get("/requests", getRequestsPage);

// Staff profile

// Request details
staffRouter.get("/requests/:id", getRequestDetails);
export default staffRouter;
