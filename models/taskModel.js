const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
    required: true
  },
  taskTitle: {
  type: String,
  required: true,
  trim: true
},
description: {
  type: String,
  required: true,
  trim: true
},
  status: {
  type: String,
  required: true
}

}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
