const Task = require('../models/taskModel');
const mongoose = require('mongoose');

const generate4DigitId = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateUniqueTaskId = async () => {
  let attempts = 0;
  while (attempts < 10) {
    const taskId = generate4DigitId();
    const existingTask = await Task.findOne({ taskId });
    if (!existingTask) return taskId;
    attempts++;
  }
  throw new Error("Unable to generate a unique taskId after 10 attempts");
};

// add new Task
const addTask = async (req, res) => {
  const { taskTitle, description, status } = req.body;
  try {

    const existTask = await Task.findOne({ taskTitle: taskTitle.trim().toLowerCase() });

    if (existTask) {
      return res.status(409).json({ msg: "task already exists", status: 0 });
    }

    const taskId = await generateUniqueTaskId();

    const newTask = new Task({ taskId, taskTitle: taskTitle.trim().toLowerCase(), description, status });
    await newTask.save();

    return res.status(201).json({
      msg: "Task Added Successfully!",
      status: 1,
      task: {
        taskId: newTask.taskId,
        taskTitle: newTask.taskTitle,
        description: newTask.description,
        status: newTask.status,
      },
    });

  } catch (error) {
    console.error("error:", error.message);
    return res.status(500).json({ msg: "Task Add failed", status: 0 });
  }
};

// Edit Task
const editTask = async (req, res) => {
  const { id } = req.params;
  const { taskTitle, description, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "Invalid Task ID", status: 0 });
  }

  try {
    // Find task by _id
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found", status: 0 });
    }

    //Check if another task has the same title
    const existingWithSameTitle = await Task.findOne({
      taskTitle: taskTitle.trim().toLowerCase(),
      _id: { $ne: id }
    });
    if (existingWithSameTitle) {
      return res.status(409).json({ msg: "Another task with this title already exists", status: 0 });
    }

    // Update fields
    task.taskTitle = taskTitle.trim().toLowerCase();
    task.description = description;
    task.status = status;
    await task.save();

    return res.status(200).json({
      msg: "Task updated successfully",
      status: 1,
      task: task
    });

  } catch (error) {
    console.error("error:", error.message);
    return res.status(500).json({ msg: "Task update failed", status: 0 });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "Invalid Task ID", status: 0 });
  }
  try {
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ msg: "Task not found", status: 0 });
    }

    return res.status(200).json({
      msg: "Task deleted successfully",
      status: 1,
    });

  } catch (error) {
    console.error("error:", error.message);
    return res.status(500).json({ msg: "Task delete failed", status: 0 });
  }
};

// fetch all task
const taskList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit);
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const query = {
      $or: [
        { task_name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ]
    };

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      msg: "Tasks Fetch successfully",
      status: 1,
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).json({ msg: "Server error", status: 0 });
  }
};

module.exports = {
  addTask,
  editTask,
  deleteTask,
  taskList
};
