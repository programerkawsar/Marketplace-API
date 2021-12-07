const mongoose = require('mongoose')
const OrderItem = require('./orderItemModel')
const Product = require('./productModel')
const Buyer = require('./buyerModel')

const orderSchema = mongoose.Schema(
    {
        orderItems: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'OrderItem',
                required: [true, 'Order must belong to a product'],
            },
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Order must belong to a user'],
        },
        totalPrice: {
            type: Number,
            required: [true, 'Total price must be required'],
        },
        paymentMethod: {
            type: String,
            enum: ['PayPal', 'Cards', 'currentBalance'], // Payment method must be 'PayPal', 'Cards', 'currentBalance' not anything else
            required: [true, 'Payment method must be required'],
        },
        address: {
            type: String,
            required: [true, 'Address must be required'],
        },
        zip: {
            type: Number,
            required: [true, 'ZIP code must be required'],
        },
        city: {
            type: String,
            required: [true, 'City must be required'],
        },
        state: {
            type: String,
            required: [true, 'State must be required'],
        },
        country: {
            type: String,
            required: [true, 'Country must be required'],
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
orderSchema.index({ user: 1, totalPrice: -1, zip: 1, state: 1, country: 1 })

// Populate the orderItems & user when find() method call
orderSchema.pre('find', function (next) {
    this.populate([
        {
            path: 'orderItems',
            select: 'license product', // Selected fields
        },
        {
            path: 'user',
            select: 'firstName lastName avatar', // Selected fields
        },
    ])

    next()
})

// When order save into the database then 'totalSales' field will be count 1 and create a buyer document
orderSchema.post('save', function () {
    // Get order item one by one
    this.orderItems.map(async (itemId) => {
        // Get product id
        const orderItem = await OrderItem.findById(itemId)
            .select('product')
            .populate('product', 'user')

        // When find product id
        if (orderItem.product._id) {
            // Find product by ID and 'totalSales' field will be count 1
            await Product.findByIdAndUpdate(orderItem.product._id, {
                $inc: { totalSales: 1 },
            })

            // create a buyer document
            await Buyer.create({
                user: this.user,
                product: orderItem.product._id,
            })
        }
    })
})

// It is more convenient to use the name id than _id
orderSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Order', orderSchema)
