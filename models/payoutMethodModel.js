const mongoose = require('mongoose')
const validator = require('validator')

const payoutMethodSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Payment method must be belong to a user'],
            unique: 'You already added a payout method',
        },
        payoutMethod: {
            type: String,
            enum: ['PayPal', 'Payoneer'], // Payout method must be 'PayPal' & 'Payoneer' not anything else
            required: [true, 'Payment method must be required'],
        },
        email: {
            type: String,
            lowercase: true,
            required: [true, 'Please provide your payment email'],
            validate: [validator.isEmail, 'Please provide a valid email'], // Email validation
            unique: 'The email already used another person',
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
)

// Indexing for faster performance
payoutMethodSchema.index({ user: 1, email: 1 })

// Populate the user when find() method call
payoutMethodSchema.pre('find', function (next) {
    this.populate({
        path: 'user',
        select: 'firstName lastName email balance avatar', // Selected fields
    })

    next()
})

// It is more convenient to use the name id than _id
payoutMethodSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('PayoutMethod', payoutMethodSchema)
