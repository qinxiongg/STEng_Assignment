const express = require("express");
const router = express.Router();
const tmsController = require("../controllers/tmsController");
const {authenticateJWT, verifyTokenWithIPAndBrowser} = require("../middleware/middlewares");

// Protected routes for task management
router.post("/createApplication", verifyTokenWithIPAndBrowser('PL'), tmsController.createApplication);
router.post("/getUserApplicationByPermit", authenticateJWT, tmsController.getUserApplicationByPermit);
router.put("/editApplication", verifyTokenWithIPAndBrowser('PL'), tmsController.editApplication);
router.post("/createPlan", verifyTokenWithIPAndBrowser('PM'), tmsController.createPlan);
router.get("/getApplicationPlans/:appAcronym", authenticateJWT, tmsController.getApplicationPlans);
router.post("/createTask", authenticateJWT, tmsController.createTask);
router.get("/getAppRNumber/:appAcronym", authenticateJWT, tmsController.getAppRNumber);
router.post("/getAllAppTasks", authenticateJWT, tmsController.getAllAppTasks);
router.put("/updateTask", authenticateJWT, tmsController.updateTask);
router.put("/changeTaskState", authenticateJWT, tmsController.changeTaskState);

module.exports = router;