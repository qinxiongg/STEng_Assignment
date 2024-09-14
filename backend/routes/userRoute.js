const express = require("express");
const router = express.Router();
const { login, getUsers, register, addGroup } = require("../controllers/userControllers");
const { authenticateJWT } = require("../middleware/middlewares");

// const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", login);

// Private routes
router.get("/users", authenticateJWT, getUsers);
router.post("/users", authenticateJWT, register);
router.post("/group", authenticateJWT, addGroup);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
