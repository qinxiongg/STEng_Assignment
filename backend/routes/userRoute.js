const express = require("express");
const router = express.Router();

// import controllers
const { authController, getUsers, addnewUsers } = require("../controllers/userControllers");

// import middleware
const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

router.post("/login", authController);
router.get("/users", getUsers);
router.post("/addnewuser", addnewUsers)

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
