const mongoose = require('mongoose')
const Notification = require('./notificationModel')
const Product = require('./productModel')

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A comment must belong to a user'],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'A comment must belong to a product'],
        },
        text: {
            type: String,
            trim: true,
            required: [true, 'Comment text can not be empty!'],
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
commentSchema.index({ user: 1, product: 1 })

// Populate the user & replies when find() method call
commentSchema.pre('find', function (next) {
    this.populate([
        {
            path: 'user',
            select: 'firstName lastName avatar', // Select only firstName lastName avatar
        },
        {
            path: 'replies',
            select: 'user text -comment', // Select only user text and remove comment field
        },
    ])

    next()
})

// When comment save into the database then a notification was created
commentSchema.post('save', async function (doc) {
    // Get product data by ID select only user field
    const product = await Product.findById(doc.product).select('user')

    if (product) {
        // Creating notification
        await Notification.create({
            toUser: product.user,
            fromUser: doc.user,
            product: doc.product,
            type: 'comment',
        })
    }
})

// Populate replies useing virtual
commentSchema.virtual('replies', {
    ref: 'Reply',
    foreignField: 'comment',
    localField: '_id',
})

// It is more convenient to use the name id than _id
commentSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Comment', commentSchema)
