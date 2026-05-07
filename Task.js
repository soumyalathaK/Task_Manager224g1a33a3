const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  storyPoints: {
    type: Number,
    min: 0,
    max: 21,
    default: 0
  },
  dueDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  subtasks: [{
    title: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    name: String,
    url: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeTrack: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startTime: Date,
    endTime: Date,
    duration: Number,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps and handle completion
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'done' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

// Calculate task duration
taskSchema.methods.calculateDuration = function() {
  if (!this.timeTrack || this.timeTrack.length === 0) return 0;
  return this.timeTrack.reduce((total, track) => total + (track.duration || 0), 0);
};

module.exports = mongoose.model('Task', taskSchema);