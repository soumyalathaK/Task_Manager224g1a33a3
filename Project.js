const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'manager', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'archived'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['development', 'design', 'marketing', 'sales', 'other'],
    default: 'development'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  budget: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [String],
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for tasks count
projectSchema.virtual('tasksCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Update timestamps
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate progress based on tasks
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

module.exports = mongoose.model('Project', projectSchema);