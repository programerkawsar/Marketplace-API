const mongoose = require('mongoose')
const Notification = require('./notificationModel')
const Comment = require('./commentModel')

const replySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A reply must belong to a user'],
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            required: [true, 'A reply must belong to a comment'],
        },
        text: {
            type: String,
            trim: true,
            required: [true, 'Reply text can not be empty!'],
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
replySchema.index({ user: 1, product: 1 })

// Populate the user when find() method call
replySchema.pre('find', function (next) {
    this.populate({
        path: 'user',
        select: 'firstName lastName avatar', // Selected fields
    })

    next()
})

// When reply save into the database then a notification was created
replySchema.post('save', async function (doc) {
    // Get commented user & product
    const comment = await Comment.findById(doc.comment).select('user product')

    // When comment found
    if (comment) {
        // Creating notification
        await Notification.create({
            toUser: comment.user,
            fromUser: doc.user,
            product: comment.product,
            type: 'reply',
        })
    }
})

// It is more convenient to use the name id than _id
replySchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Reply', replySchema)
