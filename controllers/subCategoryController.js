const SubCategory = require('./../models/subCategoryModel')
const Category = require('./../models/categoryModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')

// Doing all operations using handler factory
exports.getAllSubCategories = factory.getAll(SubCategory)
exports.getSubCategory = factory.getOne(SubCategory)
exports.createSubCategory = factory.createOne(SubCategory)
exports.updateSubCategory = factory.updateOne(SubCategory)
// Delete sub category
exports.deleteSubCategory = catchAsync(async (req, res, next) => {
    // Find sub category by ID and delete
    const doc = await SubCategory.findByIdAndDelete(req.params.id)

    // When document not found
    if (!doc) {
        // Returning error message with status code
        return next(new AppError('No document found with that ID!', 404))
    }

    // Remove category ID from parent category
    await Category.findByIdAndUpdate(
        doc.parentCategory,
        {
            $pull: { subCategories: doc.id },
        },
        { new: true, runValidators: false }
    )

    // Server response
    res.status(202).json({
        status: 'success',
        data: doc,
    })
})
