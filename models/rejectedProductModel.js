const mongoose = require('mongoose')
const Notification = require('./notificationModel')

const rejectedProductSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A rejected product must belong to a seller'],
        },
        checker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A rejected product must belong to a checker'],
        },
        reason: {
            type: String,
            trim: true,
            required: [true, 'The rejected product must have reason'],
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
rejectedProductSchema.index({ seller: 1, checker: 1 })

// Populate the checker & seller when find() method call
rejectedProductSchema.pre('find', function (next) {
    this.populate([
        {
            path: 'seller',
            select: 'firstName lastName email avatar', // Selected fields
        },
        {
            path: 'checker',
            select: 'firstName lastName email avatar', // Selected fields
        },
    ])

    next()
})

// When rejectedProduct save into the database then a notification was created
rejectedProductSchema.post('save', async function (doc) {
    await Notification.create({
        toUser: doc.seller,
        fromUser: doc.checker,
        type: 'rejectedProduct',
        text: doc.reason,
    })
})

// It is more convenient to use the name id than _id
rejectedProductSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('RejectedProduct', rejectedProductSchema)
