import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// =====================
// REGISTER - Regular User
// =====================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = await user.generateJWTToken();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message, message: "User registration failed" });
  }
};

// =====================
// REGISTER - Seller
// =====================
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const seller = await User.create({ name, email, password, role: "seller" });

    const token = await seller.generateJWTToken();

    res.status(201).json({
      success: true,
      message: "Seller registered successfully",
      token,
      user: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        credits: seller.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message, message: "Seller registration failed" });
  }
};

// =====================
// LOGIN - Any role (user / seller / admin)
// =====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = await user.generateJWTToken();

    res.json({
      success: true,
      message: "Login Successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        purchasedProjects: user.purchasedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET CURRENT USER
// =====================
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        avatar: user.avatar,
        purchasedProjects: user.purchasedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// UPDATE PROFILE
// =====================
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// LOGOUT
// =====================
export const logoutUser = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};
