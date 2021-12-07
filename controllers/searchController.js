const Product = require('./../models/productModel')
const catchAsync = require('./../utils/catchAsync')

// Search products
exports.findProducts = catchAsync(async (req, res, next) => {
    // Get search text from request body or query
    const searchText = req.body.search || req.query.text

    // Two ways to find products 'name' & 'tags'
    const doc = await Product.find({
        $or: [
            {
                name: {
                    $regex: searchText,
                    $options: 'i', // Match upper and lower cases
                },
            },
            {
                tags: {
                    $regex: searchText,
                    $options: 'i', // Match upper and lower cases
                },
            },
        ],
    })

    // Server response
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: doc,
    })
})
