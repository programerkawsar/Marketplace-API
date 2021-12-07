const mongoose = require('mongoose')
// Mongoose slug generator
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: 'Category name must be unique',
            required: [true, 'A category must have a name'],
            minlength: [
                5,
                'Category name must have more or equal than 5 characters',
            ],
            maxlength: [
                35,
                'Category name must have less or equal than 35 characters',
            ],
        },
        slug: {
            type: String,
            slug: 'name', // Pointing on name field
            trim: true,
            unique: true,
        },
        icon: {
            type: String,
            trim: true,
        },
        color: {
            type: String,
            trim: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        subCategories: [
            // All subcategory ids stored in this field
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'SubCategory',
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
)

// Indexing for faster performance
categorySchema.index({ name: 1, slug: 1, isFeatured: -1 })

// It is more convenient to use the name id than _id
categorySchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Category', categorySchema)
