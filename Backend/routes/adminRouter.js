import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
import {
  addService,
  adminDashboard,
  changeStatus,
  editService,
  getAllUsers,
  getEditService,
  getAllStaff,
  addStaff,
  getEditStaff,
  editStaff,
  deleteStaff,
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
adminRouter.post("/services/:id/status", changeStatus);

// Assign head
adminRouter.post("/departments/:id/head", assignDepartmentHead);

// Get all staff
adminRouter.get("/staff", getAllStaff);
//
adminRouter.post("/admin/staff/:id/department", assignStaffDepartment);

/* ----------------------------- STAFF ROUTES -------------------------- */
// Add staff
adminRouter.post("/staff/add", addStaff);
// Edit staff
adminRouter.get("/staff/:id/edit", getEditStaff);
adminRouter.post("/staff/:id/edit", editStaff);

// DELETE Staff
adminRouter.post("/staff/:id/delete", deleteStaff);

export default adminRouter;
