import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config.js";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user (NO manual hashing - let the pre-save hook handle it)
    const newUser = new User({
      name,
      email,
      password, // Don't hash here - the model will handle it
    });

    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: newUser._id,
      name: newUser.name, // Include the name in the response
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({
      message: "Failed to register user",
      error: error.message,
    });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords - using bcrypt directly if comparePassword method isn't defined
    let isPasswordValid;
    if (typeof user.comparePassword === "function") {
      isPasswordValid = await user.comparePassword(password);
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Make sure JWT_SECRET is available
    const jwtSecret = JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      name: user.name,
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({
      message: "Failed to login",
      error: error.message, // Include specific error for debugging
    });
  }
};
