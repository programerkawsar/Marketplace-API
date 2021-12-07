const mongoose = require('mongoose')

const feeSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: [true, 'Amount must be required'],
        },
        license: {
            type: String,
            trim: true,
            required: [true, 'License type must be required'],
            enum: ['regular', 'extended'], // License must be 'regular' & 'extended' not anything else
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
)

// Indexing for faster performance
feeSchema.index({ amount: 1, license: 1 }, { unique: true })

// It is more convenient to use the name id than _id
feeSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

module.exports = mongoose.model('Fee', feeSchema)
