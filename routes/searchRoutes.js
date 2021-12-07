const express = require('express')
const router = express.Router()

const { findProducts } = require('./../controllers/searchController')

// Find products
router.route('/').get(findProducts)

module.exports = router
