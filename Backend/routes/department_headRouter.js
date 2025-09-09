import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
import { getAllStaff } from "../controllers/dashboard/headDashboard.js";
import { headDashboard } from "../controllers/dashboard/headDashboard.js";
import { getRequestsPage } from "../controllers/dashboard/headDashboard.js";
import { assignTasksToStaff } from "../controllers/dashboard/headDashboard.js";
const departmentHead = Router();
departmentHead.use(requireRoles("department_head"));

/* ----------------------------- Department Head ROUTES -------------------------- */

// Head Dashboard
departmentHead.get("/dashboard", headDashboard, getDashboard);

// Assign tasks to staff
departmentHead.get("/staff", getAllStaff);

// Department requests
departmentHead.get("/requests", getRequestsPage);

// Assign tasks to staff
departmentHead.post("/assign", assignTasksToStaff);

export default departmentHead;
