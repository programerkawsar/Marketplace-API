const Notification = require('./../models/notificationModel')
const factory = require('./handlerFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

// Get all current user notifications
exports.getAllNotifications = catchAsync(async (req, res, next) => {
    // Get notifications by current user ID
    const doc = await Notification.find({ toUser: req.user.id })

    // Server response
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: doc,
    })
})

// Seened all unseen notifications
exports.seenAllNotifications = catchAsync(async (req, res, next) => {
    // Find by current user ID and update many
    const doc = await Notification.updateMany(
        { toUser: req.user.id },
        { seen: true },
        {
            new: true,
            runValidators: true,
        }
    )

    // Server response
    res.status(200).json({
        status: 'success',
        data: 'Successfully seened all unseen notifications',
    })
})

// Seened one notification
exports.seenNotification = catchAsync(async (req, res, next) => {
    // Find by current user ID and update one
    const doc = await Notification.findByIdAndUpdate(
        req.params.id,
        { seen: true },
        {
            new: true,
            runValidators: true,
        }
    )

    // When document not found
    if (!doc) {
        // Returning error message with status code
        return next(new AppError('No document found with that ID!', 404))
    }

    // Server response
    res.status(200).json({
        status: 'success',
        data: doc,
    })
})

// Doing delete operation using handler factory
exports.deleteNotification = factory.deleteOne(Notification)
