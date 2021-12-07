const Review = require('./../models/reviewModel')
const Buyer = require('./../models/buyerModel')
const factory = require('./handlerFactory')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

// Set current user ID & product ID in request body
exports.setProductUserIds = (req, res, next) => {
    // When user not logged in
    if (!req.user.id) {
        // Returning error message with status code
        return next(
            new AppError('User must be login to access this route', 401)
        )
    }

    // Set user ID
    req.body.user = req.user.id
    // Set product ID when not included in request body
    // Get product ID from request params
    if (!req.body.product) req.body.product = req.params.productId
    next()
}

// Check current user purchase this product or not
exports.checkBuyer = catchAsync(async (req, res, next) => {
    // Find buyer data
    const doc = await Buyer.find({
        user: req.body.user,
        product: req.body.product,
    })

    // When document not found
    if (doc.length === 0) {
        // Returning error message with status code
        return next(new AppError('The user did not purchase the product', 404))
    }

    next()
})

// Doing all operations using handler factory
exports.getAllReviews = factory.getAll(Review)
// Get review with population
exports.getReview = factory.getOne(Review, { path: 'user' })
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review, ['product']) // Not allowed field 'product'
exports.deleteReview = factory.deleteOne(Review)
