const mongoose = require('mongoose')

const buyerSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Buyer must belong to a user'],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Buyer must belong to a product'],
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
buyerSchema.index({
    user: 1,
    product: 1,
})

// Populate the user when find() method call
buyerSchema.pre('find', function (next) {
    this.populate([
        {
            path: 'user',
            select: 'country', // Select only user country
        },
    ])

    next()
})

// It is more convenient to use the name id than _id
buyerSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Buyer', buyerSchema)
