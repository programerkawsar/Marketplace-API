const mongoose = require('mongoose')
const Notification = require('./notificationModel')
const Product = require('./productModel')

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: [true, 'Review must belong to a product'],
        },
        text: {
            type: String,
            trim: true,
            required: [true, 'Review text can not be empty!'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
)

// Indexing for faster performance
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

// Populate the user when find() method call
reviewSchema.pre('find', function (next) {
    this.populate({
        path: 'user',
        select: 'firstName lastName avatar', // Selected fields
    })

    next()
})

// Calculate average ratings user mongoDB aggregate
reviewSchema.statics.calcAverageRatings = async function (productId) {
    // Get number of ratings
    const stats = await this.aggregate([
        {
            $match: { product: productId },
        },
        {
            $group: {
                _id: '$product',
                numOfRating: { $sum: 1 }, // Sum num of rating
                avgRating: { $avg: '$rating' }, // Calculate average
            },
        },
    ])

    // Number of ratings greater than 0
    if (stats.length > 0) {
        // Update product 'ratingsQuantity' & 'ratingsAverage' fields
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: stats[0].numOfRating,
            ratingsAverage: stats[0].avgRating,
        })
    } else {
        // If Number of ratings less than 0
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        })
    }
}

// When review save into the database then call this statics 'calcAverageRatings'
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.product)
})

// When call findOneAndDelete & findOneAndUpdate then pre set the document
reviewSchema.pre('findOneAnd', async function (next) {
    this.document = await this.findOne()
    next()
})

// When review delete into the database then call this statics 'calcAverageRatings'
reviewSchema.post('findOneAnd', async function () {
    await this.document.constructor.calcAverageRatings(this.document.product)
})

// When review save into the database then a notification was created
reviewSchema.post('save', async function (doc) {
    // Get user data from product
    const product = await Product.findById(doc.product).select('user')

    if (product) {
        // Creating notification
        await Notification.create({
            toUser: product.user,
            fromUser: doc.user,
            product: doc.product,
            type: 'review',
            text: doc.rating,
        })
    }
})

module.exports = mongoose.model('Review', reviewSchema)
