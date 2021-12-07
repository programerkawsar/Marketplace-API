const Payout = require('./../models/payoutModel')
const User = require('./../models/userModel')
const PayoutMethod = require('./../models/payoutMethodModel')
const factory = require('./handlerFactory')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const EmailTransmitter = require('./../utils/emailTransmitter')

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

// Set seller data and send emails
exports.setSellerData = catchAsync(async (req, res, next) => {
    // Get user data by ID
    const user = await User.findById(req.body.seller).select(
        'firstName email balance'
    )
    // Get payout method by ID
    const payout = await PayoutMethod.find({ user: req.body.seller }).select(
        'payoutMethod'
    )

    // Payout balance minimum must be $50
    // When balance less than $50
    if (user.balance < 50) {
        // Get full current date
        // Example: January 2021
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]
        const date = new Date()
        // Format date
        const fullDate = months[date.getMonth()] + ' ' + date.getFullYear()

        // Email subject and email body text
        const emailSub = 'We couldn’t process your payment'
        const emailText = `
            Hi ${user.firstName},
            <br/>
            We’re sorry to say that we have not been able to process your payment for your Market Earnings this month.
            <br/>
            This may be because Amount is less than $50.00 (required by Payoneer). Your earnings for ${fullDate} were $${user.balance}.
            Please review your payment details and make sure they are all correct. If you have any questions, please contact our friendly support team who can help you out.
        `

        // Send payout email
        await new EmailTransmitter(user).sendPayoutEmail(emailSub, emailText)

        // Returning error message with status code
        return next(
            new AppError('The seller does not have sufficient balance', 400)
        )
    }

    // When seller did not include payout method
    if (!payout[0].payoutMethod) {
        // Returning error message with status code
        return next(new AppError('The seller does not set payout method', 400))
    }

    // Find user data and update to balance 0
    await User.findByIdAndUpdate(
        req.body.seller,
        { balance: 0 },
        {
            new: true,
            runValidators: false,
        }
    )

    // Email subject and email body text
    const emailSub = 'Your payout has been processed'
    const emailText = `
        Hi ${user.firstName},
        <br/>
        It's Payday! We just processed your payout for $${user.balance} less $0.00 USD via ${payout[0].payoutMethod}.
    `

    // Send payout email
    await new EmailTransmitter(user).sendPayoutEmail(emailSub, emailText)

    // Set in request body
    req.body.amount = user.balance
    req.body.paymentMethod = payout.payoutMethod
    next()
})

// Doing all operations using handler factory
exports.getAllPayouts = factory.getAll(Payout)
exports.getPayout = factory.getOne(Payout, [
    { path: 'user' }, // Population
    { path: 'seller' }, // Population
])
exports.createPayout = factory.createOne(Payout)
exports.deletePayout = factory.deleteOne(Payout)
