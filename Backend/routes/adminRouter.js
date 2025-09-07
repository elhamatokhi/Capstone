import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";

const adminRouter = Router();

adminRouter.use(requireRoles("admin"));

adminRouter.get("/dashboard", getDashboard);

/* ----------------------------- Admin ROUTES -------------------------- */

export default adminRouter;
