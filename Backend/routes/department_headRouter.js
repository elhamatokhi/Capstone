import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
import { getAllStaff } from "../controllers/dashboard/headDashboard.js";
import { requests } from "../controllers/dashboard/staffDashboardController.js";

const departmentHead = Router();
departmentHead.use(requireRoles("department_head"));

/**--------------------------Citizen routes------------------------ */ //

// Head Dashboard
departmentHead.get("/dashboard", getAllStaff, requests, getDashboard);

export default departmentHead;
