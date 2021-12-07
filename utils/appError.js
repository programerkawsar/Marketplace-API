// Application error handling
// Some changes have been made in the built-in error class to show our errors more beautifully
class AppError extends Error {
    constructor(message, statusCode) {
        super(message) // Send message to super class

        this.statusCode = statusCode // modify status code
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error' // modify status
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError
