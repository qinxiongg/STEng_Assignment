const express = require("express");
const router = express.Router();
const restAPIController = require("../controllers/restAPIController");

router.post("/CreateTask", restAPIController.createTask);
router.get("/GetTaskByState", restAPIController.getTaskByState);
router.put("/PromoteTask2Done", restAPIController.promoteTask2Done);

module.exports = router;
