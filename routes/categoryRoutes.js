const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')
const {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController')

router
    .route('/')
    .get(getAllCategories) // Get all categories
    .post(protect, restrictTo('teamMember', 'admin'), createCategory) // Create category & this route uses only 'admin', 'teamMember'
router
    .route('/:id')
    .get(getCategory) // Get a single category
    .put(protect, restrictTo('teamMember', 'admin'), updateCategory) // Update category & this route uses only 'admin', 'teamMember'
    .delete(protect, restrictTo('teamMember', 'admin'), deleteCategory) // Delete category & this route uses only 'admin', 'teamMember'

module.exports = router
