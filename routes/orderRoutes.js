const express = require('express')
const router = express.Router()

const orderController = require('./../controllers/orderController')
// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')

// The user must be logged in to access below the routes
router.use(protect)

router
    .route('/')
    .get(restrictTo('admin'), orderController.getAllOrders) //  Get all orders & this route access only whose role is 'admin'
    .post(
        orderController.setUserId, // Set current user ID
        orderController.setOrderTotal, // Set order total
        orderController.paymentProcessing, // Get payment
        orderController.createOrder // Create order
    )

router
    .route('/:id')
    .get(orderController.getOrder) // Get order by id
    .delete(restrictTo('admin'), orderController.deleteOrder) // Delete order

module.exports = router
