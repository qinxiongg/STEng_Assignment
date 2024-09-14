const express = require("express");
const router = express.Router();
const { login, getUsers, register } = require("../controllers/userControllers");
const { authenticateJWT } = require("../middleware/middlewares");

// const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", login);

// Private routes
router.get("/users", authenticateJWT, getUsers);
router.post("/users", authenticateJWT, register);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
