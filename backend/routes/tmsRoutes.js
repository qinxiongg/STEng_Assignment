const express = require("express");
const router = express.Router();
const tmsController = require("../controllers/tmsController");
const {authenticateJWT} = require("../middleware/middlewares");

// Protected routes for task management
router.post("/createApplication", authenticateJWT, tmsController.createApplication);
router.get("/applications", authenticateJWT, tmsController.showAllApplications);
router.put("/editApplication", authenticateJWT, tmsController.editApplication);
router.post("/createPlan", authenticateJWT, tmsController.createPlan);
router.get("/getApplicationPlans/:appAcronym", authenticateJWT, tmsController.getApplicationPlans);

module.exports = router;