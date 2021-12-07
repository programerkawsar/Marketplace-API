const Category = require('./../models/categoryModel')
const factory = require('./handlerFactory')

// Doing all operations using handler factory
exports.getAllCategories = factory.getAll(Category)
// Get category with population
exports.getCategory = factory.getOne(Category, { path: 'subCategories' })
exports.createCategory = factory.createOne(Category)
exports.updateCategory = factory.updateOne(Category)
exports.deleteCategory = factory.deleteOne(Category)
