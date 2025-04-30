const { SignUp, LogIn } = require('../controllers/authComponents');
const {singleUser, editUser, deleteUser} = require('../controllers/userComponets');
const {validateSignup, validateLogin, updateUser, updatePassword}= require('../middleware/validateInput');
const verifyToken = require('../middleware/verifyToken');

const route=require('express').Router();

route.post('/signUp', validateSignup, SignUp);
route.post('/login', validateLogin, LogIn);
route.get('/profile', verifyToken, singleUser);

module.exports=route