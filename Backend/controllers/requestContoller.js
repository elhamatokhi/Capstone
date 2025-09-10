// controllers/requestController.js
import {
  fetchRequestDetails,
  updateStatus,
} from "./dashboard/staffDashboardController.js";

export const changeRequestStatus = async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  try {
    await updateStatus(status, requestId);

    req.flash("success_msg", `Request ${status} successfully.`);
    res.redirect(`/requests/${requestId}`);
    // 👆 dynamic redirect depending on role
  } catch (error) {
    console.error("Error changing request status:", error);
    req.flash("error_msg", "Failed to update request status.");
    res.redirect(`/${req.user.role}/requests/${requestId}`);
  }
};

// Route handler of Request Details
export const getRequestDetails = async (req, res) => {
  const requestId = req.params.id;
  const role = req.user.role;
  console.log(role);
  try {
    const requests = await fetchRequestDetails(requestId);
    res.render("staff/requestDetails", {
      request: requests.request,
      documents: requests.documents,
      navbarPartial: `../partials/navbar-${req.user.role}`,
    });
  } catch (err) {
    console.error("Error fetching request details:", err);
    req.flash("error_msg", "Failed to load request details.");
    res.redirect("/staff/requests");
  }
};
