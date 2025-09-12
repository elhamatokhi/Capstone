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
  getAllRequests,
  getAllServices,
  assignStaffDepartment,
  assignDepartmentHead,
} from "../controllers/dashboard/adminDashboard.js";
const adminRouter = Router();

adminRouter.use(requireRoles("admin"));

adminRouter.get("/dashboard", adminDashboard);

// Get all requests
adminRouter.get("/requests", getAllRequests);

// Manage Departments
adminRouter.get("/departments", getAllDepartments);

// Get all users
adminRouter.get("/users", getAllUsers);

// Get all services
adminRouter.get("/services", getAllServices);

// Add Service
adminRouter.post("/services/add", addService);

// Edit service
adminRouter.get("/services/:id/edit", getEditService);
adminRouter.post("/services/:id/edit", editService);

// Delete service
adminRouter.post("/services/:id/delete", deleteService);

// Assign head
adminRouter.post("/departments/:id/head", assignDepartmentHead);

//
adminRouter.post("/admin/staff/:id/department", assignStaffDepartment);
/* ----------------------------- Admin ROUTES -------------------------- */

export default adminRouter;
