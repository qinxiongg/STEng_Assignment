const express = require("express");
const router = express.Router();

// import controllers
const {
  authController,
  fetchUsers,
} = require("../controllers/userControllers");

// import middleware
const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

router.post("/login", authController);
router.get("/users", fetchUsers);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
