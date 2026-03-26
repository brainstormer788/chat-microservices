const User = require("../models/userModel");
const generateToken = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const { getCookieName, getCookieOptions } = require("../utils/cookies");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email
});

const setAuthCookie = (res, userId) => {
  res.cookie(getCookieName(), generateToken(userId), getCookieOptions());
};

exports.signup = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    setAuthCookie(res, user._id);

    return res.status(201).json({
      message: "Registered successfully",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register right now" });
  }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      setAuthCookie(res, user._id);

      return res.json({
        message: "Logged in successfully",
        user: sanitizeUser(user)
      });
    }

    return res.status(401).json({
      message: "Invalid credentials"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to log in right now"
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch user" });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie(getCookieName(), getCookieOptions());
  return res.json({ message: "Logged out successfully" });
};
