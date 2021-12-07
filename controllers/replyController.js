const Reply = require('./../models/replyModel')
const factory = require('./handlerFactory')
const AppError = require('./../utils/appError')

// Set current user ID & comment ID in request body
exports.setCommentUserIds = (req, res, next) => {
    // When user not logged in
    if (!req.user.id) {
        // Returning error message with status code
        return next(
            new AppError('User must be login to access this route', 401)
        )
    }

    // Set user ID
    req.body.user = req.user.id
    // Set comment ID when not included in request body
    // Get comment ID from request params
    if (!req.body.comment) req.body.comment = req.params.commentId
    next()
}

// Doing all operations using handler factory
exports.createReply = factory.createOne(Reply)
exports.updateReply = factory.updateOne(Reply)
exports.deleteReply = factory.deleteOne(Reply)
