const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')
const {
    getCurrentUserBuyers,
    getAllBuyers,
    getBuyer,
} = require('../controllers/buyerController')

// Get all current logged in user buyers
router.route('/current-user').get(protect, getCurrentUserBuyers)
// Get all buyers & this route access only whose role is 'admin'
router.route('/').get(protect, restrictTo('admin'), getAllBuyers)
// Get a buyer & this route access only whose role is 'admin'
router.route('/:id').get(protect, restrictTo('admin'), getBuyer)

module.exports = router
