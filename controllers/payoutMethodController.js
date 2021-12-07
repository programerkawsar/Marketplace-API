const PayoutMethod = require('../models/payoutMethodModel')
const factory = require('./handlerFactory')
const AppError = require('./../utils/appError')

// Set current user ID
exports.setUserId = (req, res, next) => {
    // When user not logged in
    if (!req.user.id) {
        // Returning error message with status code
        return next(
            new AppError('User must be login to access this route', 401)
        )
    }

    // Set user ID in request body
    req.body.user = req.user.id
    next()
}

// Doing all operations using handler factory
exports.getAllPayoutMethods = factory.getAll(PayoutMethod)
// Get payout method with population
exports.getPayoutMethod = factory.getOne(PayoutMethod, { path: 'user' })
exports.createPayoutMethod = factory.createOne(PayoutMethod)
exports.updatePayoutMethod = factory.updateOne(PayoutMethod)
exports.deletePayoutMethod = factory.deleteOne(PayoutMethod)
