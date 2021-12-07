const mongoose = require('mongoose')

const orderItemSchema = mongoose.Schema(
    {
        quantity: {
            type: Number,
            default: 1,
        },
        license: {
            type: String,
            trim: true,
            required: [true, 'License type must be required'],
            enum: ['regular', 'extended'], // License must be 'regular' & 'extended' not anything else
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Order item must belong to a product'],
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
orderItemSchema.index({
    product: 1,
})

// Populate the product when find() method call
orderItemSchema.pre('find', function (next) {
    this.populate({
        path: 'product',
        select: 'name thumbnail standardPrice extendedPrice discountPercentage', // Selected fields
    })

    next()
})

// It is more convenient to use the name id than _id
orderItemSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('OrderItem', orderItemSchema)
