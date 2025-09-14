const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Report description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Report Classification
  category: {
    type: String,
    required: [true, 'Report category is required'],
    enum: {
      values: [
        'technical_issue',
        'service_complaint', 
        'payment_issue',
        'delivery_problem',
        'communication_issue',
        'account_issue',
        'feature_request',
        'bug_report',
        'other'
      ],
      message: 'Invalid report category'
    }
  },
  
  priority: {
    type: String,
    required: [true, 'Report priority is required'],
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Invalid priority level'
    },
    default: 'medium'
  },
  
  status: {
    type: String,
    required: true,
    enum: {
      values: ['open', 'in_progress', 'resolved', 'closed', 'rejected'],
      message: 'Invalid report status'
    },
    default: 'open'
  },
  
  // User Information
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  
  reporterRole: {
    type: String,
    required: true,
    enum: ['user', 'logistics', 'admin']
  },
  
  // Related Entities (optional)
  relatedShipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    default: null
  },
  
  relatedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null
  },
  
  // Admin Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Resolution Information
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  
  resolvedAt: {
    type: Date,
    default: null
  },
  
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments/Updates
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    isInternal: {
      type: Boolean,
      default: false // Internal comments only visible to admins
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  isPublic: {
    type: Boolean,
    default: false // Whether report is visible to other users
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ status: 1, priority: -1, createdAt: -1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ assignedTo: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
reportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for formatted creation date
reportSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for report age
reportSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get report statistics
reportSchema.statics.getReportStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    rejected: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Instance method to add comment
reportSchema.methods.addComment = function(userId, message, isInternal = false) {
  this.comments.push({
    user: userId,
    message,
    isInternal,
    createdAt: new Date()
  });
  return this.save();
};

// Instance method to update status
reportSchema.methods.updateStatus = function(newStatus, userId, resolution = null) {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  if (newStatus === 'resolved' || newStatus === 'closed') {
    this.resolvedAt = new Date();
    this.resolvedBy = userId;
    if (resolution) {
      this.resolution = resolution;
    }
  }
  
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);
