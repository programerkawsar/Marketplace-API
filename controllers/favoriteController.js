const Product = require('./../models/productModel')
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

// Added to favorite
exports.addToFavorite = catchAsync(async (req, res, next) => {
    // Find product and push current user ID to favorites field
    await Product.findByIdAndUpdate(
        req.body.product,
        {
            $addToSet: { favorites: req.body.user },
        },
        { new: true, runValidators: false }
    )

    // Server response
    res.status(200).json({
        status: 'success',
        message: 'Product has been added to favorites',
    })
})

// Remove from favorite
exports.removeFromFavorite = catchAsync(async (req, res, next) => {
    // Find product and pull current user ID from favorites field
    await Product.findByIdAndUpdate(
        req.body.product,
        {
            $pull: { favorites: req.body.user },
        },
        { new: true, runValidators: false }
    )

    // Server response
    res.status(200).json({
        status: 'success',
        message: 'Product has been remove from favorites',
    })
})
