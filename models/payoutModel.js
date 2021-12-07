const mongoose = require('mongoose')
const Notification = require('./notificationModel')

const payoutSchema = new mongoose.Schema(
    {
        // Who make payment for seller this id will be here
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Payout must be belong to a user'],
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Payout must be belong to a seller'],
        },
        amount: Number,
        paymentMethod: {
            type: String,
            enum: ['PayPal', 'Payoneer'], // Payment method must be 'PayPal' & 'Payoneer' not anything else
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
payoutSchema.index({ user: 1, seller: 1 })

// Populate the user & seller when find() method call
payoutSchema.pre('find', function (next) {
    this.populate([
        {
            path: 'user',
            select: 'firstName lastName email avatar', // Selected fields
        },
        {
            path: 'seller',
            select: 'firstName lastName email balance avatar', // Selected fields
        },
    ])

    next()
})

// When payout save into the database then a notification was created
payoutSchema.post('save', async function (doc) {
    // Creating notification
    await Notification.create({
        toUser: doc.seller,
        fromUser: doc.user,
        type: 'payout',
        text: `We just processed your payout for $${doc.amount} less $0.00 USD via ${doc.paymentMethod}`,
    })
})

// It is more convenient to use the name id than _id
payoutSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Payout', payoutSchema)
