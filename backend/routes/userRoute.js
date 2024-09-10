const express = require("express");
const router = express.Router();

// import controllers
const { loginController } = require("../controllers/userControllers");

// import middleware
const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

router.post("/login", loginController);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
