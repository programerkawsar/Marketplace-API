const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xssClean = require('xss-clean')
const hpp = require('hpp')
const compression = require('compression')

// Application error handling file
const AppError = require('./utils/appError')
// Global error handling file
const globalErrorHandler = require('./controllers/errorController')

// Routes
const userRouter = require('./routes/userRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const subCategoryRouter = require('./routes/subCategoryRoutes')
const productRouter = require('./routes/productRoutes')
const rejectedProductRouter = require('./routes/rejectedProductRoutes')
const licenseFeeRouter = require('./routes/licenseFeeRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const favoriteRouter = require('./routes/favoriteRoutes')
const searchRouter = require('./routes/searchRoutes')
const notificationRouter = require('./routes/notificationRoutes')
const orderRouter = require('./routes/orderRoutes')
const buyerRouter = require('./routes/buyerRoutes')
const payoutMethodRouter = require('./routes/payoutMethodRoutes')
const payoutRouter = require('./routes/payoutRoutes')

const app = express()

// Enable trusted proxy
app.enable('trust proxy')

// Allow cors for all origin
app.use(cors())
// Access-Control-Allow-Origin *
// app.use(cors({
//   origin: 'http://localhost:3000'
// }))

// Allow for all HTTP requests
app.options('*', cors())

// Serving static files
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))

// Set security HTTP headers
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Parses cookies attached to the client request object
app.use(cookieParser())

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    handler: function (req, res) {
        // Error response
        return res.status(429).json({
            status: 'error',
            message:
                'Too many requests from this IP, please try again in an hour!',
        })
    },
})
app.use('/api', limiter) // Use the limiter

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50mb' })) // Limit 50MB per request
app.use(express.urlencoded({ extended: true, limit: '50mb' })) // Limit 50MB per request

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xssClean())

// Prevent parameter pollution
app.use(hpp())

// Compression middleware makes it faster our app
app.use(compression())

// convert request time to ISO format
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

// API URL
const api = process.env.API_URL

// Route middlewares
app.use(`${api}/users`, userRouter)
app.use(`${api}/categories`, categoryRouter)
app.use(`${api}/sub-categories`, subCategoryRouter)
app.use(`${api}/products`, productRouter)
app.use(`${api}/reject-products`, rejectedProductRouter)
app.use(`${api}/license-fees`, licenseFeeRouter)
app.use(`${api}/reviews`, reviewRouter)
app.use(`${api}/favorites`, favoriteRouter)
app.use(`${api}/search`, searchRouter)
app.use(`${api}/notifications`, notificationRouter)
app.use(`${api}/orders`, orderRouter)
app.use(`${api}/buyers`, buyerRouter)
app.use(`${api}/payout-methods`, payoutMethodRouter)
app.use(`${api}/payouts`, payoutRouter)

// If the API request is not found
app.all('*', (req, res, next) => {
    // Error message with status code
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

// Use global error handler
app.use(globalErrorHandler)

module.exports = app
