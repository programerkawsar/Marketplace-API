const RejectedProduct = require('../models/rejectedProductModel')
const Product = require('./../models/productModel')
const factory = require('./handlerFactory')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const EmailTransmitter = require('./../utils/emailTransmitter')

// Reject product
exports.rejectProduct = catchAsync(async (req, res, next) => {
    // Check email text in request
    if (!req.body.emailText) {
        // Returning error message with status code
        return next(new AppError('Email text must be required', 400))
    }

    // Find product by ID and delete
    const doc = await Product.findByIdAndDelete(req.params.id).populate('user')

    // When document not found
    if (!doc) {
        // Returning error message with status code
        return next(new AppError('No document found with that ID!', 404))
    }

    // Create document for recording reason
    await RejectedProduct.create({
        seller: doc.user._id,
        checker: req.user.id,
        reason: req.body.emailText,
    })

    // Send email
    await new EmailTransmitter(doc.user).sendRejectedProductEmail(
        doc.name,
        req.body.emailText
    )

    // Server response
    res.status(202).json({
        status: 'success',
        data: 'The product has been successfully rejected',
    })
})

// Doing all operations using handler factory
exports.getAllRejectedProducts = factory.getAll(RejectedProduct)
exports.getRejectedProduct = factory.getOne(RejectedProduct, [
    { path: 'seller' }, // Population
    { path: 'checker' }, // Population
])
