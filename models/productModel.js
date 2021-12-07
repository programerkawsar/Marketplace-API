const mongoose = require('mongoose')
// Mongoose slug generator
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: false,
            required: [true, 'A product must have a name'],
            minlength: [
                10,
                'Product name must have more or equal than 10 characters',
            ],
            maxlength: [
                100,
                'Product name must have less or equal than 100 characters',
            ],
        },
        slug: {
            type: String,
            slug: 'name', // Pointing on name field
            trim: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
            minlength: [
                200,
                'Description must have more or equal than 200 characters',
            ],
        },
        thumbnail: {
            type: String,
            required: [true, 'A product must have a thumbnail'],
        },
        imageGallery: [
            {
                type: String,
                required: [true, 'A product must have gallery image'],
            },
        ],
        productFiles: {
            type: String,
            required: [true, 'A product must have a product files'],
            select: false,
        },
        standardPrice: {
            type: Number,
            required: [true, 'A product must have a standard license price'],
        },
        extendedPrice: {
            type: Number,
            required: [true, 'A product must have a extended license price'],
        },
        discountPercentage: {
            type: Number,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A product must belong to a user'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'A product must belong to a category'],
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
            required: [true, 'A product must belong to a sub category'],
        },
        tags: [
            {
                type: String,
                trim: true,
                validate: {
                    // Validate date tags length
                    validator: function () {
                        return !(this.tags.length < 4)
                    },
                    message: () => `Tags must be equal or greater than 5!`,
                },
                required: [true, 'A product must have some tags'],
            },
        ],
        offerExpiryDate: {
            type: Date,
            validate: {
                // Validate date and check past dates
                validator: function () {
                    const currDate = new Date()
                    const inputDate = new Date(this.offerExpiryDate)

                    return !(inputDate !== currDate && inputDate < currDate)
                },
                message: () => `Refrain from using past dates!`,
            },
        },
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        totalSales: {
            type: Number,
            default: 0,
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Average rating must be above 1.0'],
            max: [5, 'Average rating must be below 5.0'],
            set: (val) => Math.round(val * 10) / 10, // Returning actual rating
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        fileTypes: [
            {
                type: String,
                trim: true,
            },
        ],
        fileSize: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        published: {
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
productSchema.index({
    user: -1,
    category: -1,
    ratingsQuantity: -1,
    ratingsAverage: -1,
})
productSchema.index({
    name: 1,
    slug: 1,
    tags: 1,
    totalSales: -1,
    isFeatured: -1,
    published: -1,
})

// Get only published products
productSchema.pre('find', function (next) {
    this.find({ published: { $ne: false } })
    next()
})

// Populate user, category & subCategory when find() method call
productSchema.pre('find', function (next) {
    this.populate([
        {
            path: 'user',
            select: 'firstName lastName avatar', // Selected fields
        },
        {
            path: 'category',
            select: 'name slug', // Selected fields
        },
        {
            path: 'subCategory',
            select: 'name slug', // Selected fields
        },
    ])

    next()
})

// Populate comments useing virtual
productSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'product',
    localField: '_id',
})

// Populate reviews useing virtual
productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id',
})

// It is more convenient to use the name id than _id
productSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Product', productSchema)
