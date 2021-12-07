const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Handling UNCAUGHT EXCEPTION errors
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...')
    console.log(err.name, err.message)
    // Close the server
    process.exit(1)
})

// Dot env file
dotenv.config({ path: './config.env' })
const app = require('./app')

// MongoDB database connection
const DB = process.env.DB_CONNECTION_STRING.replace(
    '<DATABASE_NAME>',
    process.env.DATABASE_NAME
).replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Database connection successful')
    })

// Local server connection
const port = process.env.PORT || 3000
const server = app.listen(port, () =>
    console.log(`App listening at http://localhost:${port}`)
)

// Handling UNHANDLED REJECTION errors
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down...')
    console.log(err.name, err.message)
    // Close the server
    server.close(() => {
        process.exit(1)
    })
})

// Handling SIGTERM RECEIVED errors
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully')
    // Close the server
    server.close(() => {
        console.log('Process terminated!')
    })
})
