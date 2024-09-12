const express = require("express");
const router = express.Router();

// import controllers
const {
  authController,
  getUsers,
  register,
} = require("../controllers/userControllers");

// import middleware
const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

router.post("/login", authController);
router.get("/users", getUsers);
router.post("/users", register);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
