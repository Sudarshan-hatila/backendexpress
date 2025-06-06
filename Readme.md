const express = require("express");
const connectDB = require("./database");
const bcrypt = require('bcrypt');  
const jwt = require('jsonwebtoken');
const User = require("./models/User");
const token = require("./middleware/authtoken");
const sendMail = require("./config/nodemailerConfig");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorhandler");
const { authMiddleware, athorizeRole } = require("./middleware/authorization");
require('dotenv').config();

const app = express();
app.use(express.json());

// Database connection
connectDB();

// ------------------ REGISTER USER ------------------
app.post("/register-user", async (req, res, next) => {
    try {
        const { name, email, password, contact, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // OTP and password hashing
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ name, email, password: hashPassword, contact, otp, role });
        await newUser.save();

        // Optional: Sending OTP email (uncomment below if sendMail is configured)
        /*
        const subject = 'Welcome to our Platform - OTP Verification';
        const text = `Hi ${name}, your OTP is ${otp}. Please do not share it.`;
        const html = `<h2>Welcome!</h2><p>Your OTP is <strong>${otp}</strong>. Please do not share it with anyone.</p>`;
        await sendMail(email, subject, text, html);
        */

        return res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ------------------ GET ALL USERS ------------------
app.get("/allusers", logger, async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred" });
    }
});

// ------------------ UPDATE USER ------------------
app.put("/users/:id", logger, async (req, res) => {
    try {
        const { name, email, password, contact } = req.body;
        const updatedFields = { name, email, contact };

        if (password) {
            const hashPassword = await bcrypt.hash(password, 10);
            updatedFields.password = hashPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred" });
    }
});

// ------------------ DELETE USER ------------------
app.delete("/delete/:id", logger, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred" });
    }
});

// ------------------ LOGIN USER ------------------
app.post("/login", logger, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(403).json({ message: "User does not exist" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        next(error);
    }
});


//-----------------------otp verify--------------------
app.post("/verify", async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "user not found..." });
      }
      if (otp === user.otp) {
        console.log("otp verified...");
        user.otp = null;
        await user.save();
        return res.status(202).json({ message: "otp verification success..." });
      } else {
        return res.status(405).json({ message: "otp not matched..." });
      }
    } catch (error) {
      return res.status(503).json({ message: "error in verify otp..." });
    }
  });
  

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});#   b a c k e n d e x p r e s s  
 #   b a c k e n d  
 