const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')
const commentRouter = require('../routes/commentRoutes')
const replyRouter = require('../routes/replyRoutes')
const reviewRouter = require('../routes/reviewRoutes')

const {
    setUserId,
    fileUploadMiddleware,
    uploadProductFiles,
    updateProductFiles,
    deleteProductFiles,
    attachLicenseFee,
    incViews,
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    approvalForPublished,
    cancelPublished,
} = require('../controllers/productController')

// Comments, replies & reviews routes
// The user must be logged in to access below the routes
router.use('/:productId/comments', protect, commentRouter)
router.use('/:productId/replies/:commentId', protect, replyRouter)
router.use('/:productId/reviews', protect, reviewRouter)

// Products routes
router
    .route('/')
    .get(getAllProducts) // Get all products
    .post(
        protect, // User must be logged in
        setUserId, // Set current user ID
        fileUploadMiddleware, // Multer file upload middleware
        uploadProductFiles, // Upload product files
        attachLicenseFee, // Attach license fee
        createProduct // Create product
    )

router
    .route('/:id')
    .get(incViews, getProduct) // Increase product views
    .put(
        protect, // User must be logged in
        setUserId, // Set current user ID
        fileUploadMiddleware, // Multer file upload middleware
        updateProductFiles, // Upload product files
        attachLicenseFee, // Attach license fee
        updateProduct // Create product
    )
    .delete(protect, deleteProductFiles, deleteProduct) // Delete product

// Product published & unpublished routes
// Below the routes access only whose role is 'team Member', 'admin'
router
    .route('/published/:id')
    .put(protect, restrictTo('teamMember', 'admin'), approvalForPublished) // Approval for published product
router
    .route('/unpublished/:id')
    .put(protect, restrictTo('teamMember', 'admin'), cancelPublished) // Cancel published

module.exports = router
