const express = require('express')
const router = express.Router()

// 'protect' method check user authentication
// 'restrictTo' method specify routes access by the user role
const { protect, restrictTo } = require('../controllers/authController')
const {
    getAllLicenseFees,
    getLicenseFee,
    createLicenseFee,
    updateLicenseFee,
    deleteLicenseFee,
} = require('../controllers/LicenseFeeController')

router
    .route('/')
    .get(getAllLicenseFees) // Get all license fees
    .post(protect, restrictTo('admin'), createLicenseFee) // Create license fee & this route access only whose role is 'admin'
router
    .route('/:id')
    .get(getLicenseFee) // Get a license fee
    .put(protect, restrictTo('admin'), updateLicenseFee) // Update license fee & this route access only whose role is 'admin'
    .delete(protect, restrictTo('admin'), deleteLicenseFee) // Delete license fee & this route access only whose role is 'admin'

module.exports = router
