require('dotenv').config();
const User = require('../models/authModel');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

// registration
const SignUp = async (req, res) => {
  try {
    const { name, email, phone, password} = req.body;
    // Check if user already exists
    const existUser = await User.findOne({ phone });
    if (existUser) {
      return res.status(409).json({ msg: "User already exists", status: 0 });
    }
    // Check email already exists
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(409).json({ msg: "Email already exists", status: 0 });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({name, email, phone, password: hashPassword});
    await newUser.save();

    return res.status(201).json({
      msg: "Registration Successful!",
      status: 1,
      // user: {
      //   name: newUser.name,
      //   email: newUser.email,
      //   phone: newUser.phone,
        
      // },
    });

  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ msg: "Signup failed", status: 0 });
  }
};

// login
const LogIn = async (req, res) => {
    try {
      const { phone, password } = req.body;
  
      // Check if user exists
      const findUser = await User.findOne({ phone });
      if (!findUser) {
        return res.status(400).json({ msg: "User not found", status: 0 });
      }
      // Compare password
      const isMatchPassword = await bcrypt.compare(password, findUser.password);
      if (!isMatchPassword) {
        return res.status(401).json({ msg: "Invalid credentials", status: 0 });
      }
      // Generate JWT token
      const token = JWT.sign(
        {
          id: findUser._id,
          email: findUser.email,
          phone: findUser.phone
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      // Successful response
      return res.status(200).json({
        msg: "Login successful",
        status: 1,
        access_token: token,
        // user:findUser
      });
  
    } catch (error) {
      console.error("Login error:", error.message);
      return res.status(500).json({ msg: "Login failed", status: 0 });
    }
  };

module.exports ={
    SignUp,
    LogIn
};
