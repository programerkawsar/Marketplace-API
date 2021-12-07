const mongoose = require('mongoose')
const User = require('./userModel')
const Product = require('./productModel')
const EmailTransmitter = require('./../utils/emailTransmitter')

const notificationSchema = new mongoose.Schema(
    {
        // This notification to the user who has this id
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A notification must belong to a user'],
        },
        // This notification from the user who has this id
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A notification must belong to a user'],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        type: {
            type: String,
            trim: true,
            required: [true, 'Notification type must be required'],
        },
        text: {
            type: String,
            trim: true,
        },
        seen: {
            type: Boolean,
            default: false,
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
notificationSchema.index({ toUser: 1, fromUser: 1, product: 1 })

// Populate the product & fromUser when find() method call
notificationSchema.pre('find', function (next) {
    this.populate([
        {
            path: 'product',
            select: 'name thumbnail standardPrice extendedPrice discountPercentage', // Selected fields
        },
        {
            path: 'fromUser',
            select: 'firstName lastName avatar', // Selected fields
        },
    ])

    next()
})

// When notification save into the database then send a email to then user
notificationSchema.post('save', async function (doc) {
    // Get user firstName & email
    const user = await User.findById(doc.toUser).select('firstName email')
    // Get product name
    const product = await Product.findById(doc.product).select('name')

    let emailSub, emailText

    // If notification type is comment
    if (doc.type === 'comment') {
        // Set email subject and body
        emailSub = `New comment on '${product.name}'`
        emailText = `
            You've received this email because you opted to receive item comment notification
            <br/>
            You can change your preferences at: ${process.env.API_URL}/${product._id}
        `
    }

    // If notification type is reply
    if (doc.type === 'reply') {
        // Set email subject and body
        emailSub = `New reply on '${product.name}'`
        emailText = `
            You've received this email because you opted to receive item reply notification
            <br/>
            You can change your preferences at: ${process.env.API_URL}/${product._id}
        `
    }

    // If notification type is review
    if (doc.type === 'review') {
        // Set email subject and body
        emailSub = `New review on '${product.name}'`
        emailText = `
            Your product got a new ${doc.text} rating
            <br/>
            You can change your preferences at: ${process.env.API_URL}/${product._id}
         `
    }

    // If notification type is not 'rejectedProduct' & 'payout'
    // Because this type of email already sent from controllers
    if (doc.type !== 'rejectedProduct' || doc.type !== 'payout') {
        // Sending email
        await new EmailTransmitter(user).sendNotificationEmail(
            emailSub,
            emailText
        )
    }
})

// It is more convenient to use the name id than _id
notificationSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Notification', notificationSchema)
