const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
const { protect } = require('../controllers/authController')
const {
    setProductUserIds,
    addToFavorite,
    removeFromFavorite,
} = require('../controllers/favoriteController')

// The user must be logged in to access below the routes
router.use(protect)

router.route('/add').put(setProductUserIds, addToFavorite) // Added to favorite
router.route('/remove').put(setProductUserIds, removeFromFavorite) // Remove from favorite

module.exports = router
