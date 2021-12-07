const Buyer = require('./../models/buyerModel')
const factory = require('./handlerFactory')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('../utils/appError')

// Get current user buyers data
exports.getCurrentUserBuyers = catchAsync(async (req, res, next) => {
    // When user not logged in
    if (!req.user.id) {
        // Returning error message with status code
        return next(
            new AppError('User must be login to access this route', 401)
        )
    }

    // Get user data by current user id
    const doc = await Buyer.find({ user: req.user.id })

    // When user not found
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

// Doing all operations using handler factory
exports.getAllBuyers = factory.getAll(Buyer)
exports.getBuyer = factory.getOne(Buyer, [
    { path: 'user' }, // Population
    { path: 'product' }, // Population
])
