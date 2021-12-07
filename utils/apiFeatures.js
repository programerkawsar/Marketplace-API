// This class helps to Filter, Limit Fields, Pagination and Sorting our data
class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    // All filtering
    filter() {
        const queryObj = { ...this.queryString } // Get one by one
        const excludedFields = ['page', 'sort', 'limit', 'fields'] // Selected fields
        excludedFields.forEach((el) => delete queryObj[el]) // Delete field when not match

        // Advanced filtering
        // MongoDB filter 'greater than', 'less than' etc
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        )

        // Finally get data and return this
        this.query = this.query.find(JSON.parse(queryStr))

        return this
    }

    // Sorting data
    sort() {
        if (this.queryString.sort) {
            // Sort data by query string fields
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            // Get newest data
            this.query = this.query.sort('-createdAt')
        }

        return this
    }

    // Limit fields
    limitFields() {
        if (this.queryString.fields) {
            // Select specific fields
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            // Select all fields without '__v'
            this.query = this.query.select('-__v')
        }

        return this
    }

    // Pagination
    paginate() {
        // Get query string page number
        const page = this.queryString.page * 1 || 1
        // Get query string page limit
        const limit = this.queryString.limit * 1 || 100
        // Skip data by page limit
        const skip = (page - 1) * limit

        // Finally get data and return this
        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

module.exports = APIFeatures
