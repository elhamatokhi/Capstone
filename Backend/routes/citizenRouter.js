import { Router } from "express";
import { ensureAuthenticated, requireRoles } from "../middleware/middleware.js";
import {
  services,
  requestService,
  submitRequest,
  getProfile,
  updateProfile,
  editProfile,
  getHistory,
  deleteRequest,
  paymentSuccess,
  postPayment,
  getDashboard,
} from "../controllers/dashboard/citizenDashboard.js";

import { upload } from "../middleware/multerConfig.js";

const citizenRouter = Router();

citizenRouter.use(requireRoles("citizen"));

/**--------------------------Citizen routes------------------------ */ //

// Citizen Dashboard
citizenRouter.get("/dashboard", services, getDashboard);

// Citizen request
citizenRouter.get("/request/:serviceId", requestService);
citizenRouter.post("/delete/:requestId", deleteRequest);
citizenRouter.post(
  "/request/:serviceId",
  upload.array("documents", 10),
  submitRequest
);

// Citizen profile
citizenRouter.get("/profile", getProfile);
citizenRouter.get("/profile/edit", editProfile);
citizenRouter.post("/profile/edit", updateProfile);

// Citizen request history
citizenRouter.get("/history", getHistory);

// GET fake payment success page
citizenRouter.get("/payment-success", paymentSuccess);
citizenRouter.post("/pay/:id", postPayment);

export default citizenRouter;
