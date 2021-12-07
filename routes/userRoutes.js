const express = require('express')
const router = express.Router()

// Authentication & Users routes
const authController = require('../controllers/authController')
const userController = require('./../controllers/userController')

// Authentication routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.put('/reset-password/:token', authController.resetPassword)

// The user must be logged in to access below the routes
router.use(authController.protect)

// Users routes
router.get('/me', userController.getMe, userController.getUser) // Get current user
router.put(
    '/updateMe',
    userController.fileMiddleware, // Multer file middleware
    userController.updateUserAvatar, // Upload user avatar
    userController.updateMe // Update user data without password
)
router.put('/updateMyPassword', authController.updatePassword) // Update user password
router.delete('/deleteMe', userController.deleteMe) // Delete current user account

//The user role must be admin to enter below the routes
router.use(authController.restrictTo('admin'))

router
    .route('/')
    .get(userController.getAllUsers) // Get all users
    .post(userController.createUser) // Create user

router
    .route('/:id')
    .get(userController.getUser) // Get a user
    .put(
        userController.fileMiddleware, // Multer file middleware
        userController.updateUserAvatar, // Upload user avatar
        userController.updateUser // Update user
    )
    .delete(userController.deleteUserAvatar, userController.deleteUser) // Delete user

module.exports = router
