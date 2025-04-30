const { addTask , editTask, deleteTask, taskList} = require('../controllers/taskComponents');
const { taskValidation } = require('../middleware/taskInputValidation');
const verifyToken = require('../middleware/verifyToken');
const taskRoute=require('express').Router();

taskRoute.post('/task/newtask',verifyToken, taskValidation, addTask);
taskRoute.put('/task/edit/:id',verifyToken, editTask);
taskRoute.delete('/task/delete/:id',verifyToken, deleteTask);
taskRoute.get('/tasks', taskList);

module.exports=taskRoute;