import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
import {
  staffDashboard,
  getRequestDetails,
  getStaffRequest,
  approveRequest,
  rejectRequest,
} from "../controllers/dashboard/staffDashboardController.js";

const staffRouter = Router();
staffRouter.use(requireRoles("staff"));

/**--------------------------Citizen routes------------------------ */ //

// Staff Dashboard
staffRouter.get("/dashboard", staffDashboard, getDashboard);

// Citizen requests
staffRouter.get("/requests", getStaffRequest);

// Staff profile

// Request details
staffRouter.get("/requests/:id", getRequestDetails);

// Approve a request
staffRouter.post("/requests/:id/approve", approveRequest);

// Reject a request
staffRouter.post("/requests/:id/reject", rejectRequest);
export default staffRouter;
