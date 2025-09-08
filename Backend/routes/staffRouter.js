import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
import { requests } from "../controllers/dashboard/staffDashboardController.js";

const staffRouter = Router();
staffRouter.use(requireRoles("staff"));

/**--------------------------Citizen routes------------------------ */ //

// Staff Dashboard
staffRouter.get("/dashboard", requests, getDashboard);

// Citizen requests

export default staffRouter;
