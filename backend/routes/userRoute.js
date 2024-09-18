const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const { authenticateJWT, verifyTokenWithIPAndBrowser } = require("../middleware/middlewares");

// const { verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", userController.login);

// Private routes
router.get("/users", verifyTokenWithIPAndBrowser("admin"), userController.getUsers);
router.post("/users", verifyTokenWithIPAndBrowser("admin"), userController.register);
router.post("/editprofile", verifyTokenWithIPAndBrowser("admin"), userController.editUser);
router.post("/groups", authenticateJWT, userController.addGroups);
router.get("/groups", authenticateJWT, userController.getGroups);
router.get("/userinfo", authenticateJWT, userController.getUsername);
router.get("/profile", authenticateJWT, userController.getUserProfile);
router.patch("/profile", authenticateJWT, userController.updateUserProfile);
router.get("/isAdmin", userController.checkIsAdmin);

// router.get("/profile", verifyTokenWithIPAndBrowser, getUserController);

module.exports = router;
