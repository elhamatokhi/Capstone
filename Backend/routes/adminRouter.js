import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
import {
  addService,
  adminDashboard,
  deleteService,
  editService,
  getAllUsers,
  getEditService,
} from "../controllers/dashboard/adminDashboard.js";
import {
  fetchRequests,
  getAllDepartments,
} from "../controllers/dashboard/adminDashboard.js";
const adminRouter = Router();

adminRouter.use(requireRoles("admin"));

adminRouter.get("/dashboard", adminDashboard, getDashboard);

// Get all users

// Get all departments

// Get all requests
adminRouter.get("/requests", fetchRequests);

// Manage Departments
adminRouter.get("/departments", getAllDepartments);

// Get all users
adminRouter.get("/users", getAllUsers);

// Add Service
adminRouter.post("/services/add", addService);

// Edit service
adminRouter.get("/services/:id/edit", getEditService);
adminRouter.post("/services/:id/edit", editService);

// Delete service
adminRouter.post("/services/:id/delete", deleteService);

/* ----------------------------- Admin ROUTES -------------------------- */

export default adminRouter;
