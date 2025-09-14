const Report = require('../models/Report');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/emailService');

// Create a new report
const createReport = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      priority = 'medium',
      relatedShipment,
      relatedBid,
      tags = [],
      isPublic = false
    } = req.body;

    // Verify related entities exist if provided
    if (relatedShipment) {
      const shipment = await Shipment.findById(relatedShipment);
      if (!shipment) {
        return res.status(400).json({
          success: false,
          message: 'Related shipment not found'
        });
      }
    }

    if (relatedBid) {
      const bid = await Bid.findById(relatedBid);
      if (!bid) {
        return res.status(400).json({
          success: false,
          message: 'Related bid not found'
        });
      }
    }

    // Create the report
    const report = new Report({
      title,
      description,
      category,
      priority,
      reporter: req.user._id,
      reporterRole: req.user.role,
      relatedShipment: relatedShipment || null,
      relatedBid: relatedBid || null,
      tags,
      isPublic
    });

    // Add initial comment
    report.comments.push({
      user: req.user._id,
      message: `Report created: ${description}`,
      isInternal: false,
      createdAt: new Date()
    });

    await report.save();

    // Populate reporter information
    await report.populate('reporter', 'name email companyName role');

    // Create notification for report creation
    try {
      const notificationData = {
        recipient: report.reporter._id,
        type: 'report_created',
        title: `Report Created: ${report.title}`,
        message: `Your report "${report.title}" has been successfully created and is now being reviewed.`,
        relatedEntity: {
          type: 'report',
          id: report._id
        },
        metadata: {
          reportId: report._id,
          reportTitle: report.title,
          status: report.status,
          priority: report.priority,
          category: report.category
        },
        priority: 'medium'
      };

      await NotificationService.createNotification(notificationData);
      console.log(`✅ Report creation notification sent to user ${report.reporter._id}`);
    } catch (notificationError) {
      console.error('❌ Failed to create report creation notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

// Get all reports for a user (their own reports)
const getUserReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { reporter: req.user._id };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const reports = await Report.find(filter)
      .populate('reporter', 'name email companyName role')
      .populate('assignedTo', 'name email companyName')
      .populate('resolvedBy', 'name email companyName')
      .populate('relatedShipment', 'trackingNumber origin destination')
      .populate('relatedBid', 'amount status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

// Get all reports (admin only)
const getAllReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      priority, 
      reporterRole,
      assignedTo,
      search 
    } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (reporterRole) filter.reporterRole = reporterRole;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const reports = await Report.find(filter)
      .populate('reporter', 'name email companyName role')
      .populate('assignedTo', 'name email companyName')
      .populate('resolvedBy', 'name email companyName')
      .populate('relatedShipment', 'trackingNumber origin destination')
      .populate('relatedBid', 'amount status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('reporter', 'name email companyName role')
      .populate('assignedTo', 'name email companyName')
      .populate('resolvedBy', 'name email companyName')
      .populate('relatedShipment', 'trackingNumber origin destination status')
      .populate('relatedBid', 'amount status')
      .populate('comments.user', 'name email companyName role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user can view this report
    if (req.user.role !== 'admin' && report.reporter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own reports.'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

// Update report (admin only)
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority, resolution } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update fields
    if (status) report.status = status;
    if (assignedTo) report.assignedTo = assignedTo;
    if (priority) report.priority = priority;
    if (resolution) report.resolution = resolution;

    // Handle status changes
    if (status === 'resolved' || status === 'closed') {
      report.resolvedAt = new Date();
      report.resolvedBy = req.user._id;
    }

    await report.save();

    // Add comment about the update
    await report.addComment(
      req.user._id,
      `Report updated: Status changed to ${status}${assignedTo ? `, assigned to admin` : ''}`,
      true
    );

    await report.populate('reporter', 'name email companyName role');
    await report.populate('assignedTo', 'name email companyName');
    await report.populate('resolvedBy', 'name email companyName');

    // Send email notification to the reporter about status change
    if (status && report.reporter.email) {
      try {
        const statusMessages = {
          'in_progress': 'Your report is now being reviewed and is in progress.',
          'resolved': 'Your report has been resolved! Thank you for your feedback.',
          'closed': 'Your report has been closed.',
          'rejected': 'Your report has been reviewed but was not accepted.'
        };

        const statusMessage = statusMessages[status] || `Your report status has been updated to ${status}.`;
        
        const emailSubject = `Report Update: ${report.title}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Report Status Update</h2>
            <p>Hello ${report.reporter.name || report.reporter.companyName},</p>
            <p>${statusMessage}</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Report Details:</h3>
              <p><strong>Title:</strong> ${report.title}</p>
              <p><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Priority:</strong> ${report.priority.toUpperCase()}</p>
              <p><strong>Category:</strong> ${report.category.replace('_', ' ').toUpperCase()}</p>
              ${resolution ? `<p><strong>Resolution:</strong> ${resolution}</p>` : ''}
            </div>
            
            <p>You can view the full report details by logging into your account.</p>
            <p>Thank you for using RoamEase!</p>
          </div>
        `;

        await sendEmail({
          to: report.reporter.email,
          subject: emailSubject,
          html: emailHtml
        });

        console.log(`✅ Report status update email sent to ${report.reporter.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send report status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Create in-app notification for the reporter
    if (status && report.reporter._id) {
      try {
        const statusMessages = {
          'in_progress': 'Your report is now being reviewed and is in progress.',
          'resolved': 'Your report has been resolved! Thank you for your feedback.',
          'closed': 'Your report has been closed.',
          'rejected': 'Your report has been reviewed but was not accepted.'
        };

        const notificationMessage = statusMessages[status] || `Your report status has been updated to ${status}.`;
        
        const notificationData = {
          recipient: report.reporter._id,
          type: 'report_updated',
          title: `Report Status Updated: ${report.title}`,
          message: notificationMessage,
          relatedEntity: {
            type: 'report',
            id: report._id
          },
          metadata: {
            reportId: report._id,
            reportTitle: report.title,
            newStatus: status,
            priority: report.priority,
            category: report.category
          },
          priority: report.priority === 'urgent' ? 'high' : 'medium'
        };

        await NotificationService.createNotification(notificationData);
        console.log(`✅ Report status update notification created and sent to user ${report.reporter._id}`);
      } catch (notificationError) {
        console.error('❌ Failed to create report status update notification:', notificationError);
        // Don't fail the request if notification creation fails
      }
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

// Add comment to report
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isInternal = false } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user can comment on this report
    if (req.user.role !== 'admin' && report.reporter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only comment on your own reports.'
      });
    }

    await report.addComment(req.user._id, message, isInternal);

    await report.populate('comments.user', 'name email companyName role');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: report.comments
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Get report statistics (admin only)
const getReportStats = async (req, res) => {
  try {
    const stats = await Report.getReportStats();
    
    // Get additional statistics
    const categoryStats = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Report.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentReports = await Report.find()
      .populate('reporter', 'name email companyName role')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        categoryStats,
        priorityStats,
        recentReports
      }
    });

  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report statistics',
      error: error.message
    });
  }
};

// Delete report (admin only)
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

module.exports = {
  createReport,
  getUserReports,
  getAllReports,
  getReport,
  updateReport,
  addComment,
  getReportStats,
  deleteReport
};
