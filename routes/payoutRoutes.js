const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')
const {
    setUserId,
    setSellerData,
    getAllPayouts,
    getPayout,
    createPayout,
    deletePayout,
} = require('../controllers/payoutController')

router
    .route('/')
    // Get all payouts & this route access only whose role is 'admin', 'teamMember'
    .get(protect, restrictTo('teamMember', 'admin'), getAllPayouts)
    .post(
        protect,
        restrictTo('teamMember', 'admin'), // This route access only whose role is 'admin', 'teamMember'
        setUserId, // Set current user ID
        setSellerData, // Set seller data
        createPayout // Create payout
    )
router
    .route('/:id')
    // Get payout & this route access only whose role is 'admin', 'teamMember'
    .get(protect, restrictTo('teamMember', 'admin'), getPayout)
    // Delete payout and this route access only whose role is 'admin'
    .delete(protect, restrictTo('admin'), deletePayout)

module.exports = router
