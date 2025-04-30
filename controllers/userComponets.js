require('dotenv').config();
const User = require('../models/authModel');
const bcrypt=require('bcrypt');
const mongoose=require('mongoose')

// single user fetch
const singleUser=async(req,res)=>{
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('-password');
        if (!user) {
          return res.status(404).json({ msg: "User not found", status: 0 });
        }
        // Return the user data
        return res.status(200).json({
          msg: "User fetched successfully",
          status: 1,
          user,
        });
      } catch (error) {
        console.error('Error fetching user:', error.message);
        return res.status(500).json({ msg: "Failed to fetch user", status: 0 });
      }
};

// edite user data
const editUser=async(req,res)=>{
    try {
      const { name, email, phone, password, address, state, city, pin, dob, gender } = req.body;
    
        // Get user ID from the jwt token
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ msg: "User not found", status: 0 });
        }
        // Update the user's fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
        }
        if (address) user.address = address;
        if (state) user.state = state;
        if (city) user.city = city;
        if (pin) user.pin = pin;
        if (dob) user.dob = dob;
        if (gender) user.gender = gender;
        await user.save();
        return res.status(200).json({
          msg: "Profile updated successfully",
          status: 1,
          // user: user
          
        });
      } catch (error) {
        console.error('Error updating user:', error.message);
        return res.status(500).json({ msg: "Failed to update user", status: 0 });
      }
};

// delete user
const deleteUser=async(req,res)=>{
    try {
      const userId = req.user.id;
    
        // Validate if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ msg: "Invalid user ID", status: 0 });
        }
    
        // Attempt to find and delete the user by ID
        const user = await User.findByIdAndDelete(userId);
    
        if (!user) {
          return res.status(404).json({ msg: "User not found", status: 0 });
        }
    
        return res.status(200).json({
          msg: "User deleted successfully",
          status: 1
        });
      } catch (error) {
        console.error('Error deleting user:', error.message);
        return res.status(500).json({
          msg: "Failed to delete user",
          status: 0,
          error: error.message
        });
      }
}

module.exports={
singleUser,
editUser,
deleteUser
};