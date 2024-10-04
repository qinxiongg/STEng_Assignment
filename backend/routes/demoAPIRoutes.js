const express = require("express");
const router = express.Router();
const demoAPIController = require("../controllers/demoAPIController");

router.post("/CreateTask", demoAPIController.createTask);
router.post("/GetTaskByState", demoAPIController.getTaskByState);
router.post("/PromoteTask2Done", demoAPIController.promoteTask2Done);

module.exports = router;
