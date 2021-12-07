const express = require('express')
const router = express.Router({ mergeParams: true })

const commentController = require('./../controllers/commentController')
// 'protect' method check user authentication
const { protect } = require('../controllers/authController')

// The user must be logged in to access below the routes
router.use(protect)

router
    .route('/')
    .get(commentController.getAllComments) // Get all comments
    .post(commentController.setProductUserIds, commentController.createComment) // Create comment

router
    .route('/:id')
    .get(commentController.getComment) // Get a comment
    .put(commentController.updateComment) // Update comment
    .delete(commentController.deleteComment) // Delete comment

module.exports = router
