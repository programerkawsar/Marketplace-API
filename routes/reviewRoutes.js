const express = require('express')
const router = express.Router({ mergeParams: true })

const reviewController = require('./../controllers/reviewController')
// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')

router
    .route('/')
    .get(
        protect, // User must be logged in
        restrictTo('teamMember', 'admin'), //This route access only whose role is 'admin'
        reviewController.getAllReviews // Get all reviews
    )
    .post(
        protect, // User must be logged in
        reviewController.setProductUserIds, // Set current user & product ID
        reviewController.checkBuyer, // Check current user this product buy or not
        reviewController.createReview // Create a review
    )

router
    .route('/:id')
    .get(reviewController.getReview) // Get a review
    .put(
        protect, // User must be logged in
        reviewController.setProductUserIds, // Set current user & product ID
        reviewController.checkBuyer, // Check current user this product buy or not
        reviewController.updateReview // Update a review
    )
    .delete(protect, reviewController.checkBuyer, reviewController.deleteReview) // Delete review

module.exports = router
