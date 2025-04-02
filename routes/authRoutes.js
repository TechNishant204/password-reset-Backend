const express = require("express");
const router = express.Router();

const authController = require("../controller/authController");

//Forgot password route
router.post("/forgot-password", authController.forgotPassword);

// Verify reset token and redirect to frontend (GET for Link)
router.get("/reset-password/:token", authController.verifyToken);

// Reset Password route
router.post("/reset-password", authController.resetPassword); // Removed the :token parameter

//Login Route
router.post("/login", authController.login);

// Signup route
router.post("/signup", authController.signup);

module.exports = router;
