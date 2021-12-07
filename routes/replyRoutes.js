const express = require('express')
const router = express.Router({ mergeParams: true })

const replyController = require('./../controllers/replyController')
// 'protect' method check user authentication
const { protect } = require('../controllers/authController')

router.route('/').post(
    protect, // User must be logged in
    replyController.setCommentUserIds, // Set comment & user ID
    replyController.createReply // Create reply
)

router
    .route('/:id')
    .put(protect, replyController.updateReply) // Update reply
    .delete(protect, replyController.deleteReply) // Delete reply

module.exports = router
