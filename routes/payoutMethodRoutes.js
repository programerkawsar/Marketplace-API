const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')
const {
    setUserId,
    getAllPayoutMethods,
    getPayoutMethod,
    createPayoutMethod,
    updatePayoutMethod,
    deletePayoutMethod,
} = require('../controllers/payoutMethodController')

router
    .route('/')
    // Get all payout methods & this route access only whose role is 'admin'
    .get(protect, restrictTo('teamMember', 'admin'), getAllPayoutMethods)
    // Set current user ID & create payout method this route uses for seller
    .post(protect, restrictTo('seller'), setUserId, createPayoutMethod)
router
    .route('/:id')
    .get(protect, restrictTo('seller'), getPayoutMethod) // Get payout method and this route uses for seller
    .put(protect, restrictTo('seller'), updatePayoutMethod) // Update payout method and this route uses for seller
    .delete(protect, restrictTo('seller'), deletePayoutMethod) // Delete payout method and this route uses for seller

module.exports = router
