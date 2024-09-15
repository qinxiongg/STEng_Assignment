const express = require("express");
const router = express.Router();
const { login, getUsers, register, addGroups, getGroups } = require("../controllers/userControllers");
const { authenticateJWT } = require("../middleware/middlewares");

// const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", login);

// Private routes
router.get("/users", authenticateJWT, getUsers);
router.post("/users", authenticateJWT, register);
router.post("/groups", authenticateJWT, addGroups);
router.get("/groups", authenticateJWT, getGroups);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
