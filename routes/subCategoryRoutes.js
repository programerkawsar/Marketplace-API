const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')
const {
    getAllSubCategories,
    getSubCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
} = require('../controllers/subCategoryController')

router
    .route('/')
    .get(getAllSubCategories)
    // Create subcategory & this route access only whose role is 'admin', 'teamMember'
    .post(protect, restrictTo('teamMember', 'admin'), createSubCategory)

// Below the routes access only whose role is 'team Member', 'admin'
router
    .route('/:id')
    .get(protect, restrictTo('teamMember', 'admin'), getSubCategory) // Get subcategory
    .put(protect, restrictTo('teamMember', 'admin'), updateSubCategory) // Update subcategory
    .delete(protect, restrictTo('teamMember', 'admin'), deleteSubCategory) // Delete subcategory

module.exports = router
