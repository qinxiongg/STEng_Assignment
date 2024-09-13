const express = require("express");
const router = express.Router();
const { login, getUsers, register } = require("../controllers/userControllers");
const { authJWT } = require("../middleware/middlewares");

// const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", login);

// Private routes
router.get("/users", authJWT, getUsers);
router.post("/users", authJWT, register);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
