const sizeOf = require('image-size')
const Product = require('./../models/productModel')
const LicenseFee = require('../models/licenseFeeModel')
const User = require('./../models/userModel')
const factory = require('./handlerFactory')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const fileRegulator = require('./../utils/fileRegulator')
const EmailTransmitter = require('./../utils/emailTransmitter')

// Set current user ID
exports.setUserId = (req, res, next) => {
    // When user not logged in
    if (!req.user.id) {
        // Returning error message with status code
        return next(
            new AppError('User must be login to access this route', 401)
        )
    }

    // Set user ID in request body
    req.body.user = req.user.id
    next()
}

// Set files array for server request
exports.fileUploadMiddleware = fileRegulator.diskStorage('products').fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'imageGallery', maxCount: 10 }, // Maximum 10 files
    { name: 'productFiles', maxCount: 1 },
])

// Upload product files
exports.uploadProductFiles = catchAsync(async (req, res, next) => {
    // Check product thumbnail in request
    if (!req.files.thumbnail)
        // Returning error message with status code
        return next(new AppError('A product must have a thumbnail', 400))

    // Check product thumbnail width and height
    // Thumbnail dimensions must be 200X200
    if (req.files.thumbnail[0].fieldname === 'thumbnail') {
        // Get image dimensions
        const dimensions = sizeOf(req.files.thumbnail[0].path)

        // Check dimensions
        if (dimensions.width !== 200 && dimensions.height !== 200) {
            // Returning error message with status code
            return next(
                new AppError(
                    'A product thumbnail dimensions must be 200X200',
                    400
                )
            )
        }
    }

    // Check product imageGallery in request
    if (!req.files.imageGallery)
        // Returning error message with status code
        return next(new AppError('A product must have gallery images', 400))

    // Check product productFiles in request
    if (!req.files.productFiles)
        // Returning error message with status code
        return next(new AppError('A product must have product files', 400))

    // Base URL
    const basePath = `${req.protocol}://${req.get('host')}`

    // Set thumbnail full URL
    // Remove some string from file destination
    req.body.thumbnail = `${basePath}/${req.files.thumbnail[0].destination.substring(
        2
    )}/${req.files.thumbnail[0].filename}`

    // Gallery images URL
    req.body.imageGallery = []

    await Promise.all(
        // Push one by one useing loop
        req.files.imageGallery.map(async (file) => {
            // Push full image URL
            req.body.imageGallery.push(
                `${basePath}/${file.destination.substring(2)}/${file.filename}` // Remove some string from file destination
            )
        })
    )

    // Set productFiles full URL
    // Remove some string from file destination
    req.body.productFiles = `${basePath}/${req.files.productFiles[0].destination.substring(
        2
    )}/${req.files.productFiles[0].filename}`

    next()
})

// Update product files
exports.updateProductFiles = catchAsync(async (req, res, next) => {
    // If not add any files in request
    if (!req.files) return next()

    // Base path
    const basePath = `${req.protocol}://${req.get('host')}`
    // Get product data by ID with 'productFiles' field
    const doc = await Product.findById(req.params.id).select('+productFiles')

    // Update only thumbnail
    if (req.files.thumbnail) {
        // Delete old thumbnail
        if (doc) await fileRegulator.deleteSingleFile(doc.thumbnail)

        // Set new thumbnail URL
        req.body.thumbnail = `${basePath}/${req.files.thumbnail[0].destination.substring(
            2
        )}/${req.files.thumbnail[0].filename}`
    }

    // Update gallery images
    if (req.files.imageGallery) {
        // Delete all old gallery images
        if (doc) await fileRegulator.deleteMultipleFiles(doc.imageGallery)

        // Set new gallery images URL
        req.body.imageGallery = []

        await Promise.all(
            // Push one by one useing loop
            req.files.imageGallery.map(async (file) => {
                // Push full image URL
                req.body.imageGallery.push(
                    `${basePath}/${file.destination.substring(2)}/${
                        file.filename
                    }`
                )
            })
        )
    }

    // Update product files
    if (req.files.productFiles) {
        // Delete old product files
        if (doc) await fileRegulator.deleteSingleFile(doc.productFiles)

        // Set new productFiles URL
        req.body.productFiles = `${basePath}/${req.files.productFiles[0].destination.substring(
            2
        )}/${req.files.productFiles[0].filename}`
    }

    next()
})

// Delete all product files
exports.deleteProductFiles = catchAsync(async (req, res, next) => {
    // Get product data by ID with 'productFiles' field
    const doc = await Product.findById(req.params.id).select('+productFiles')

    // If document found
    if (doc) {
        // Deleteing thumbnail
        await fileRegulator.deleteSingleFile(doc.thumbnail)
        // Deleteing all gallery images
        await fileRegulator.deleteMultipleFiles(doc.imageGallery)
        // Deleteing product files
        await fileRegulator.deleteSingleFile(doc.productFiles)
    }

    next()
})

// Attach application fee with requested price
exports.attachLicenseFee = catchAsync(async (req, res, next) => {
    // This condition for updating product data without prices
    if (!req.body.standardPrice && !req.body.extendedPrice) return next()

    // Get application fee only first 2 document
    // First one for 'regular' & Second is 'extended'
    const results = await LicenseFee.find().limit(2)
    if (results) {
        for (let i in results) {
            // Set regular fee
            if (results[i].license === 'regular' && req.body.standardPrice) {
                // Added requested price with application fee
                req.body.standardPrice = await (parseInt(
                    req.body.standardPrice
                ) + parseInt(results[i].amount))
            }

            // Set extended fee
            if (results[i].license === 'extended' && req.body.extendedPrice) {
                // Added requested price with application fee
                req.body.extendedPrice = await (parseInt(
                    req.body.extendedPrice
                ) + parseInt(results[i].amount))
            }
        }
    }

    next()
})

// Increment product views
exports.incViews = catchAsync(async (req, res, next) => {
    // Find product by ID and update views
    await Product.findByIdAndUpdate(req.params.id, {
        $inc: { views: 1 },
    })

    next()
})

// Doing to complete all other operations using handler factory
exports.getAllProducts = factory.getAll(Product)
exports.getProduct = factory.getOne(Product, [
    { path: 'user', select: 'firstName lastName avatar' }, // Population
    { path: 'category', select: 'name slug' }, // Population
    { path: 'subCategory', select: 'name slug' }, // Population
    { path: 'comments' }, // Population
    { path: 'reviews' }, // Population
])
// Not allowed fields are not changeable for all user roles
// Only some user roles to permit change the fields
exports.createProduct = factory.createOne(Product, [
    'ratingsAverage', // Not allowed field
    'ratingsQuantity', // Not allowed field
    'totalSales', // Not allowed field
    'isFeatured', // Not allowed field
    'published', // Not allowed field
])
exports.updateProduct = factory.updateOne(Product, [
    'ratingsAverage', // Not allowed field
    'ratingsQuantity', // Not allowed field
    'totalSales', // Not allowed field
    'isFeatured', // Not allowed field
    'published', // Not allowed field
])
exports.deleteProduct = factory.deleteOne(Product)

// Approval for publish the product
exports.approvalForPublished = catchAsync(async (req, res, next) => {
    // Get product data by ID with populate user
    const doc = await Product.findByIdAndUpdate(
        req.params.id,
        { published: true },
        {
            new: true,
            runValidators: true,
        }
    ).populate('user')

    // When document not found
    if (!doc) {
        // Returning error message with status code
        return next(new AppError('No document found with that ID!', 404))
    }

    // If user role is 'customer' then update to 'seller'
    if (doc.user.role === 'customer') {
        await User.findByIdAndUpdate(
            doc.user._id,
            { role: 'seller' },
            {
                new: true,
                runValidators: true,
            }
        )
    }

    // Full product URL
    const productURL = `${req.protocol}://${req.get('host')}${
        process.env.API_URL
    }/products/${doc.id}`

    // Send email
    await new EmailTransmitter(doc.user).sendPublicationEmail(
        doc.name,
        productURL
    )

    // Server response
    res.status(200).json({
        status: 'success',
        data: 'The product has been published successfully',
    })
})

// Canceled product publication
exports.cancelPublished = catchAsync(async (req, res, next) => {
    // Find product by ID and update
    const doc = await Product.findByIdAndUpdate(
        req.params.id,
        { published: false },
        {
            new: true,
            runValidators: true,
        }
    )

    // When document not found
    if (!doc) {
        // Returning error message with status code
        return next(new AppError('No document found with that ID!', 404))
    }

    // Server response
    res.status(200).json({
        status: 'success',
        data: 'The product has been unpublished',
    })
})
