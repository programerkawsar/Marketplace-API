const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

// This filter is because some field user updates are not allowed
// So a new object has been created by omitting these fields
const filterObj = (obj, notAllowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach((el) => {
        // Remove not allowed fields
        if (!notAllowedFields.includes(el)) newObj[el] = obj[el]
    })

    return newObj
}

// Delete single document
exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        // Find document by ID and delete it
        const doc = await Model.findByIdAndDelete(req.params.id)

        // When document not found
        if (!doc) {
            // Returning error message with status code
            return next(new AppError('No document found with that ID!', 404))
        }

        // Server response
        res.status(202).json({
            status: 'success',
            data: doc,
        })
    })

// Update single document
exports.updateOne = (Model, notAllowedFields) =>
    catchAsync(async (req, res, next) => {
        // When req.body totally empty
        if (Object.keys(req.body).length === 0) {
            // Returning error message with status code
            return next(new AppError('You did not include any fields', 400))
        }

        let doc

        // It has some fields that are not permitted to update
        if (notAllowedFields) {
            // Filter all not allowed fields
            const filteredBody = filterObj(req.body, notAllowedFields)
            // Update document by ID
            doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
                new: true,
                runValidators: true,
            })
        } else {
            // Update document by ID with filtered no fields
            doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            })
        }

        // When document not found
        if (!doc) {
            // Returning error message with status code
            return next(new AppError('No document found with that ID!', 404))
        }

        // Server response
        res.status(200).json({
            status: 'success',
            data: doc,
        })
    })

// Create a document
exports.createOne = (Model, notAllowedFields) =>
    catchAsync(async (req, res, next) => {
        let doc

        // It has some fields that are not permitted to create
        if (notAllowedFields) {
            // Filter all not allowed fields
            const filteredBody = filterObj(req.body, notAllowedFields)
            // Create document
            doc = await Model.create(filteredBody)
        } else {
            // Create document with filtered no fields
            doc = await Model.create(req.body)
        }

        // Server response
        res.status(201).json({
            status: 'success',
            data: doc,
        })
    })

// Get a document
exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        // Get the document by ID
        let query = Model.findById(req.params.id)
        // Get the document by ID with populatetion
        if (popOptions) query = query.populate(popOptions) // Populate query
        const doc = await query

        // When document not found
        if (!doc) {
            // Returning error message with status code
            return next(new AppError('No document found with that ID!', 404))
        }

        // Server response
        res.status(200).json({
            status: 'success',
            data: doc,
        })
    })

// Get all documents with all API features
exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // To allow for nested GET reviews on product
        let filter = {}
        if (req.params.productId) filter = { product: req.params.productId }

        // Get all data & also filtering
        // All filtering methods are executed in 'APIFeatures' class
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
        const doc = await features.query

        // Server response
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: doc,
        })
    })
