const Comment = require('./../models/commentModel')
const factory = require('./handlerFactory')
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

// Doing all operations using handler factory
exports.getAllComments = factory.getAll(Comment)
// Get comment with population
exports.getComment = factory.getOne(Comment, { path: 'replies' })
exports.createComment = factory.createOne(Comment)
exports.updateComment = factory.updateOne(Comment)
exports.deleteComment = factory.deleteOne(Comment)
