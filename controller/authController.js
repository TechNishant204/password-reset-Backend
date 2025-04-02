const User = require("../models/user");
const crypto = require("crypto");
const { sendEmail, sendSignUpEmail } = require("../utils/sendEmail");
const user = require("../models/user");
const bcrypt = require("bcrypt");

// Forgot password controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .send("Your Email is not registered - User not found.");
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");

    // Store the token in the user document for later verification
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    //create client URL to send to user
    const resetLink = `http://localhost:5175/reset-password/${token}`;

    // send email to user via nodemailer - send(email,title,body)
    await sendEmail(
      email,
      "Password Reset Request!!!",
      `<p>You requested a password reset. Click the link below to reset your password.</p>
        <p>Click this link to reset your password : ${resetLink}<p>
        <p>This link will expire in 1 hour.</p>
      `
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Token verification
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;

    // token validation
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Token verified successfully",
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Reset Password Controller
exports.resetPassword = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "No token provided",
      });
    }
    const { password } = req.body;

    //validation
    if (!password) {
      return res.status(403).json({
        success: false,
        message: "Please provide valid password",
      });
    }

    //fetch user using token and check if token expiry time is greater than current time
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Check if the password is empty, less than 6 characters, not combination of letters, numbers and special characters
    if (
      !password ||
      password.length < 6 ||
      !password.match(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long and contain a combination of letters, numbers, and special characters",
      });
    }

    //hashed the password using pre save hook in user model
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting password...",
    });
  }
};

//Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const existingUser = await User.findOne({ email });
    console.log(existingUser);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `User not found`,
      });
    }

    // compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    res.status(200).json({
      success: true,
      message: "Logged In successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in...",
    });
  }
};

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    // password already hashed using pre save hook
    const user = new User({ username, email, password: password });
    await user.save();
    await sendSignUpEmail(user.email, user.username);

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while signing up...",
    });
  }
};
