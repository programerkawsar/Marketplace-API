const AppError = require('./../utils/appError')
const fileRegulator = require('./../utils/fileRegulator')

// Handle database common errors
const handleCastErrorDB = (err) => {
    // Modifying error message for beauty
    const message = `Invalid ${err.path}: ${err.value}.`
    // Returning error message with status code
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
    // Looping error messages because it has may multiple errors
    const errors = Object.values(err.errors).map((el) => el.message)
    // Modifying error message for beauty and A full stop will be added at the end of each line
    const message = `Invalid input data. ${errors.join('. ')}`
    // Returning error message with status code
    return new AppError(message, 400)
}

// Handle multer file upload middleware errors
const handleMulterFileUploadError = (err) => {
    // Handle file size limitation error
    if (err.code === 'LIMIT_FILE_SIZE') {
        // Modifying error message for beauty
        const message = `Image size is too large in the field: ${err.field}. The max supported size is 1MB or less`
        // Returning error message with status code
        return new AppError(message, 400)
    }

    // Handle file type error
    if (err.code === 'INVALID_FILE_TYPE') {
        // Modifying error message for beauty
        const message = `You have uploaded an invalid image file type`
        // Returning error message with status code
        return new AppError(message, 400)
    }

    // Handle number of limit files error
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        // Modifying error message for beauty
        const message = `You are uploading files beyond the limits in the field: ${err.field}`
        // Returning error message with status code
        return new AppError(message, 400)
    }
}

// Handle stripe payment processing errors
const stripeRequestError = (err) => {
    // I do not modify any of stripe error messages
    // Returning error message with status code
    return new AppError(err.message, 400)
}

// Handle JWT errors
const handleJWTError = () =>
    // Returning error message with status code
    new AppError('Invalid token. Please log in again!', 401)

// Handle JWT expired error
const handleJWTExpiredError = () =>
    // Returning error message with status code
    new AppError('Your token has expired! Please log in again.', 401)

// Send development errors
const sendErrorDev = (err, req, res) => {
    // Requested URL must be starts with /api
    if (req.originalUrl.startsWith('/api')) {
        // Log error
        console.error('ERROR!', err)

        // Server response
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        })
    }
}

// Send production errors
const sendErrorProd = (err, req, res) => {
    // Requested URL must be starts with /api
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            // Server response
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        }

        // Server response
        // Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        })
    }
}

module.exports = (err, req, res, next) => {
    // Set status code
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    // Development & Production mode
    if (process.env.NODE_ENV === 'development') {
        // Send developing errors
        sendErrorDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        // Specific error names not all
        if (err.name === 'CastError') err = handleCastErrorDB(err)
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err)
        if (err.name === 'MulterError') err = handleMulterFileUploadError(err)
        if (err.type === 'StripeInvalidRequestError')
            err = stripeRequestError(err)
        if (err.name === 'JsonWebTokenError') err = handleJWTError()
        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()

        // Send production errors
        sendErrorProd(err, req, res)
    }

    // When any error occurred
    // Delete the file from the storage
    if (req.file && err) {
        fileRegulator.deleteFilesWhenError(req.file, 'single')
    }

    // Delete multiple files from the storage
    if (req.files && err) {
        fileRegulator.deleteFilesWhenError(req.files, 'multiple')
    }
}
