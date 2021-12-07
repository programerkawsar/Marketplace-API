const express = require('express')
const router = express.Router({ mergeParams: true })

const notificationController = require('./../controllers/notificationController')
// 'protect' method check user authentication
const { protect } = require('../controllers/authController')

// The user must be logged in to access below the routes
router.use(protect)

router
    .route('/')
    .get(notificationController.getAllNotifications) // Get all notifications for current user
    .put(notificationController.seenAllNotifications) // Seend all unseen notifications

router
    .route('/:id')
    .put(notificationController.seenNotification) // Seend a unseen notifications
    .delete(notificationController.deleteNotification) // Delete notification

module.exports = router
