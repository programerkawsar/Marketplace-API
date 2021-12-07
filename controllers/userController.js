const User = require('./../models/userModel')
const factory = require('./handlerFactory')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const fileRegulator = require('./../utils/fileRegulator')

// Set buffer file object for server request
exports.fileMiddleware = fileRegulator.memoryStorage().single('avatar')
// Update user avatar
exports.updateUserAvatar = catchAsync(async (req, res, next) => {
    // Check file include or not in request
    if (!req.file) return next()

    // Set current user ID
    const userID = req.params.id || req.user.id
    // Get user data by ID
    const doc = await User.findById(userID)
    // Delete old avatar
    if (doc) await fileRegulator.deleteSingleFile(doc.avatar)

    // File upload directory
    const dirName = 'public/uploads/users'
    // Options for sharp lib
    const option = {
        dirName,
        imageWidth: 80,
        imageHeight: 80,
    }
    // Get uploaded filename
    const fileName = await fileRegulator.uploadAndResizeImage(option, req.file)
    // Base URL
    const basePath = `${req.protocol}://${req.get('host')}/${dirName}`

    // Set avatar full URL
    req.body.avatar = `${basePath}/${fileName}`
    next()
})

// Delete user avatar
exports.deleteUserAvatar = catchAsync(async (req, res, next) => {
    // Find user data by ID
    const doc = await User.findById(req.params.id)
    // Delete when user found
    if (doc) await fileRegulator.deleteSingleFile(doc.avatar)
    next()
})

// This filter is because some field user updates are not allowed
// So a new object has been created by omitting these fields
const filterObj = (obj, ...notAllowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach((el) => {
        // Remove not allowed fields
        if (!notAllowedFields.includes(el)) newObj[el] = obj[el]
    })

    return newObj
}

// Get current user data
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

// Update current user data
exports.updateMe = catchAsync(async (req, res, next) => {
    // Check user put password field or not
    if (req.body.password) {
        // Returning error message with status code
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword',
                400
            )
        )
    }

    // It has some fields that are not permitted to update
    const filteredBody = filterObj(
        req.body,
        'password',
        'role',
        'balance',
        'active'
    )
    // Update user data with filteredBody
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    )

    // Server response
    res.status(200).json({
        status: 'success',
        data: updatedUser,
    })
})

// Delete current user account
// It's simply deactivate the account
exports.deleteMe = catchAsync(async (req, res, next) => {
    // Find user and update
    await User.findByIdAndUpdate(req.user.id, { active: false })

    // Server response
    res.status(202).json({
        status: 'success',
        message: 'Your account has been deactivated',
    })
})

// This function is for notifying the user
exports.createUser = (req, res) => {
    // Server response
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /register instead',
    })
}

// Doing to complete all other operations using handler factory
exports.getAllUsers = factory.getAll(User)
// Get review with population
exports.getUser = factory.getOne(User, { path: 'products' })
exports.updateUser = factory.updateOne(User, ['password', 'balance']) // Not allowed field 'password', 'balance'
exports.deleteUser = factory.deleteOne(User)
