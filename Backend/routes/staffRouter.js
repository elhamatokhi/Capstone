import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import { getDashboard } from "../controllers/dashboard/citizenDashboard.js";
const staffRouter = Router();

staffRouter.use(requireRoles("staff"));

staffRouter.get("/dashboard", getDashboard);

/* ----------------------------- STAFF ROUTES -------------------------- */
export default staffRouter;
