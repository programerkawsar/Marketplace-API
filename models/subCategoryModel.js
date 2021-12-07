const mongoose = require('mongoose')
const Category = require('./categoryModel')
// Mongoose slug generator
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: 'Sub category name must be unique',
            required: [true, 'A sub category must have a name'],
            minlength: [
                5,
                'Sub category name must have more or equal than 5 characters',
            ],
            maxlength: [
                35,
                'Sub category name must have less or equal than 35 characters',
            ],
        },
        slug: {
            type: String,
            slug: 'name', // Pointing on name field
            trim: true,
            unique: true,
        },
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'A sub category must belong to a parent category'],
            select: false,
        },
        icon: {
            type: String,
            trim: true,
        },
        color: {
            type: String,
            trim: true,
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
subCategorySchema.index({ name: 1, slug: 1, parentCategory: 1 })

// When subCategory save into the database then push subCategory id into parentCategory
subCategorySchema.post('save', async function () {
    // Find parentCategory and push subCategory id
    await Category.findByIdAndUpdate(
        this.parentCategory,
        {
            $addToSet: { subCategories: this.id },
        },
        { new: true, runValidators: false }
    )
})

// It is more convenient to use the name id than _id
subCategorySchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('SubCategory', subCategorySchema)
