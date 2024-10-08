const express = require("express");
const router = express.Router();
const demoAPIController = require("../controllers/demoAPIController");
const msgCode = require("../constants/msgCode");

router.use((req, res, next) => {
  console.log(`req.originalUrl: ${req.originalUrl}`);

  if (Object.keys(req.query).length !== 0) {
    return res.status(400).json({ msgCode: msgCode.INVALID_PARAMETER });
  }

  const validUrls = [
    "/api/demo/CreateTask",
    "/api/demo/GetTaskbyState",
    "/api/demo/PromoteTask2Done",
  ];
  const url = req.originalUrl;
  console.log("incoming url:", url);

  let isValidUrl = false;

  for (const i of validUrls) {
    if (i.toLowerCase() === url.toLowerCase()) {
      isValidUrl = true;
      break;
    }
  }

  if (isValidUrl) {
    next();
    return;
  }

  res.status(400).json({ msgCode: msgCode.INVALID_URL });
  return;
});

router.post("/CreateTask", demoAPIController.CreateTask);
router.post("/GetTaskByState", demoAPIController.GetTaskByState);
router.post("/PromoteTask2Done", demoAPIController.PromoteTask2Done);

module.exports = router;
