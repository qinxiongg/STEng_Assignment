const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const { authenticateJWT, verifyTokenWithIPAndBrowser } = require("../middleware/middlewares");

// Public routes
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Protected routes for user management
router.get("/checkIsAdmin", authenticateJWT, userController.checkIsAdmin);
router.get("/users", verifyTokenWithIPAndBrowser("admin"), userController.getAllUsers);
router.post("/createUser", verifyTokenWithIPAndBrowser("admin"), userController.createUser);
router.post("/edituser", verifyTokenWithIPAndBrowser("admin"), userController.editUser);
router.post("/addNewGroups", verifyTokenWithIPAndBrowser("admin"), userController.addNewGroups);

router.get("/getAllGroups", authenticateJWT, userController.getAllGroups);
router.get("/getUsername", authenticateJWT, userController.getUsername);
router.get("/profile", authenticateJWT, userController.getUserProfile);
router.patch("/updateUserProfile", authenticateJWT, userController.updateUserProfile);


module.exports = router;
