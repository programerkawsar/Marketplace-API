const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')
const {
    rejectProduct,
    getAllRejectedProducts,
    getRejectedProduct,
} = require('../controllers/rejectedProductController')
// This method from productController
const { deleteProductFiles } = require('../controllers/productController')

// Below the routes access only whose role is 'team Member', 'admin'
router
    .route('/')
    .get(protect, restrictTo('teamMember', 'admin'), getAllRejectedProducts) // Get all rejected products
router
    .route('/:id')
    .get(protect, restrictTo('teamMember', 'admin'), getRejectedProduct) // Get rejected product
    .delete(
        protect,
        restrictTo('teamMember', 'admin'),
        deleteProductFiles, // Delete product files
        rejectProduct // Delete data from database
    )

module.exports = router
