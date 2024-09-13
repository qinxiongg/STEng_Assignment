const express = require("express");
const router = express.Router();

// import controllers
const {
  login,
  getUsers,
  register,
} = require("../controllers/userControllers");

// import middleware
// const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/users", getUsers);
router.post("/users", register);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
