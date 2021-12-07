const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const paypal = require('paypal-rest-sdk')
const Order = require('./../models/orderModel')
const OrderItem = require('./../models/orderItemModel')
const LicenseFee = require('../models/licenseFeeModel')
const User = require('./../models/userModel')
const factory = require('./handlerFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')

// PapPal configuration
paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_SECRET,
})

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

// Set order total
exports.setOrderTotal = catchAsync(async (req, res, next) => {
    // Create order items
    const orderItemsIds = Promise.all(
        // Create order item one by one
        req.body.orderItems.map(async (item) => {
            const orderItem = await OrderItem.create({
                license: item.license,
                product: item.product,
            })

            // Returning order item ID
            return orderItem.id
        })
    )

    // Resolved order item IDS
    const orderItemsIdsResolved = await orderItemsIds
    // Get app fees
    const appFee = await LicenseFee.find().limit(2)

    // Get all products total prices
    const totalPrices = await Promise.all(
        // Get total price one by one
        orderItemsIdsResolved.map(async (item) => {
            // Get product data by ID and also populate
            const orderItem = await OrderItem.findById(item).populate(
                'product',
                'user standardPrice extendedPrice discountPercentage'
            )

            let totalPrice, actualPrice

            // Check license type
            if (orderItem.license === 'regular') {
                // Set actual license price
                actualPrice = orderItem.product.standardPrice
                // Set seller balance and cut the app fee
                // Check license fee
                const fee = appFee.find((item) => item.license === 'regular')
                // Get seller balance
                const seller = await User.findById(orderItem.product.user)
                // Set balance
                seller.balance =
                    seller.balance +
                    (parseInt(actualPrice) - parseInt(fee.amount))
                // Save balance
                await seller.save({ validateBeforeSave: false })
            }

            // Check license type
            if (orderItem.license === 'extended') {
                // Set actual license price
                actualPrice = orderItem.product.extendedPrice
                // Set seller balance and cut the app fee
                // Check license fee
                const fee = appFee.find((item) => item.license === 'extended')
                // Get seller balance
                const seller = await User.findById(orderItem.product.user)
                // Set balance
                seller.balance =
                    seller.balance +
                    (parseInt(actualPrice) - parseInt(fee.amount))
                // Save balance
                await seller.save({ validateBeforeSave: false })
            }

            // Get discount percentage by each product
            const discountPercentage = orderItem.product.discountPercentage
            // Multiply actual price with quantity
            const mainPrice = actualPrice * orderItem.quantity

            // If product has discount percentage
            if (discountPercentage > 0) {
                // Set discount price
                totalPrice = mainPrice * ((100 - discountPercentage) / 100)
            } else {
                // Set actual price
                totalPrice = mainPrice
            }

            // Returning total price
            return totalPrice
        })
    )

    // Calculate total prices
    const subTotal = totalPrices.reduce((a, b) => a + b, 0)

    // Set request body
    req.body.orderItems = orderItemsIdsResolved
    req.body.totalPrice = subTotal
    return next()
})

// Payment processing step
exports.paymentProcessing = catchAsync(async (req, res, next) => {
    // Order description
    const description = `Order has been processed at ${new Date().toString()}`

    // When payment with cards
    // Payment using stripe
    if (req.body.paymentMethod === 'Cards') {
        // Create stripe customer
        const createCustomer = await stripe.customers.create({
            name: req.body.name,
            email: req.body.email,
            address: {
                line1: req.body.address,
                postal_code: req.body.zip,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
            },
            source: req.body.stripeToken,
        })

        // If customer is created
        if (createCustomer) {
            // Create stripe charges
            await stripe.charges.create({
                amount: req.body.totalPrice * 100,
                currency: 'usd',
                customer: createCustomer.id,
                description,
            })
        }
    }

    // When payment with PayPal
    if (req.body.paymentMethod === 'PayPal') {
        // Base URL
        const basePath = `${req.protocol}://${req.get('host')}`
        // Format currency for USD
        var currencyFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        })

        // PayPal payment options
        const createPayment = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: `${basePath}/success`,
                cancel_url: `${basePath}/cancel`,
            },
            transactions: [
                {
                    amount: {
                        currency: 'USD',
                        total: currencyFormatter.format(req.body.totalPrice),
                    },
                    description: description,
                },
            ],
        }

        // Create paypal payment
        paypal.payment.create(createPayment, (error, payment) => {
            if (error) {
                // Returning error message with status code
                return next(new AppError(error, 400))
            }
        })
    }

    // Payment from earning balance
    if (req.body.paymentMethod === 'currentBalance') {
        // Get user data by ID
        const user = await User.findById(req.body.user)

        // Check enough balance for purchase
        if (user.balance < req.body.totalPrice) {
            // Returning error message with status code
            return next(
                new AppError('Not have enough balance to purchase!', 400)
            )
        }

        // The total value is deducted from user balance
        // Find user by current user ID and update balance
        await User.findByIdAndUpdate(
            req.body.user,
            { balance: parseInt(user.balance) - parseInt(req.body.totalPrice) },
            {
                new: true,
                runValidators: false,
            }
        )
    }

    next()
})

// Doing all operations using handler factory
exports.getAllOrders = factory.getAll(Order)
exports.getOrder = factory.getOne(Order, [
    { path: 'user' }, // Population
    { path: 'orderItems' }, // Population
])
exports.createOrder = factory.createOne(Order)
exports.deleteOrder = factory.deleteOne(Order)
