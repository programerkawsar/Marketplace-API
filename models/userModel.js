const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
// MongoDB unique validator plugin for specially username
// because mongoose default unique keyword not working for this
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: [true, 'Please tell us your first name'],
        },
        lastName: {
            type: String,
            trim: true,
            required: [true, 'Please tell us your last name'],
        },
        username: {
            type: String,
            unique: 'Username must be unique!',
            lowercase: true,
            required: [true, 'Please provide your username'],
            minlength: [4, 'Username must be at least 4 characters'],
        },
        email: {
            type: String,
            unique: 'Email must be unique!',
            lowercase: true,
            required: [true, 'Please provide your email'],
            validate: [validator.isEmail, 'Please provide a valid email'],
        },
        password: {
            type: String,
            select: false,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters'],
        },
        role: {
            type: String,
            enum: ['customer', 'seller', 'teamMember', 'admin'], // Role must be 'customer', 'seller', 'teamMember' & 'admin' not anything else
            default: 'customer',
        },
        balance: {
            type: Number,
            default: 0,
        },
        avatar: {
            type: String,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        zip: {
            type: Number,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        subscribeNewsletter: {
            type: Boolean,
            default: true,
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
)

// use the validator plugin
userSchema.plugin(uniqueValidator)

// Indexing for faster performance
userSchema.index({ username: 1, email: 1 }, { unique: true })
userSchema.index({ phone: 1, role: 1, active: 1 })

// Hashing password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

// Set passwordChangedAt field before save
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next()
    this.passwordChangedAt = Date.now() - 1000
    next()
})

// Get only active users
userSchema.pre('find', function (next) {
    this.find({ active: { $ne: false } })
    next()
})

// Check correct hash password
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    // Compare password
    return await bcrypt.compare(candidatePassword, userPassword)
}

// Set date after changed password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        // Check password changed timestamp
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        )

        return JWTTimestamp < changedTimestamp
    }

    return false
}

// Create password reset token
userSchema.methods.createPasswordResetToken = function () {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Convert token to hash
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    // Set password reset expiry time
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

// Populate products useing virtual
userSchema.virtual('products', {
    ref: 'Product',
    foreignField: 'user',
    localField: '_id',
})

// It is more convenient to use the name id than _id
userSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('User', userSchema)
