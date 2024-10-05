const express = require("express");
const router = express.Router();
const demoAPIController = require("../controllers/demoAPIController");

router.post("/createTask", demoAPIController.createTask);
router.post("/getTaskByState", demoAPIController.getTaskByState);
router.post("/promoteTask2Done", demoAPIController.promoteTask2Done);

module.exports = router;
