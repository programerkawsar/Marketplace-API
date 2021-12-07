const fs = require('fs')
const crypto = require('crypto')
const multer = require('multer')
const sharp = require('sharp')
const AppError = require('./../utils/appError')

// Delete file from server
const deleteFile = async (link) => {
    // Validate URL
    if (link) {
        const validUrl = new URL(link)
        if (validUrl) {
            // Get pathname from URL
            const pathName = validUrl.pathname
            // Check file existence
            fs.stat(`.${pathName}`, async (err) => {
                // Deleting file
                if (!err) await fs.promises.unlink(`.${pathName}`)
            })
        }
    }
}

// Wait for delete file one by one
const waitForFileDelete = (path) => {
    const intervalObj = setInterval(async () => {
        // Check file directory
        fs.stat(path, async (err) => {
            if (!err) {
                // When file not found then stop setInterval automatically
                clearInterval(intervalObj)
                // Deleting file
                fs.unlink(path, (err) => {})
            }
        })
    }, 2000)
}

// Multer files upload directly
exports.diskStorage = (folderName) => {
    let fileDestination

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.fieldname === 'productFiles') {
                // Check ZIP or RAR file
                if (
                    file.mimetype.startsWith('application/zip') ||
                    file.mimetype.startsWith('application/x-zip-compressed')
                ) {
                    // Set folder destination
                    fileDestination = `./public/uploads/main-files`
                    // Multer callback function
                    cb(null, fileDestination)
                } else {
                    // Throw eror by callback function
                    cb(
                        // Returning error message with status code
                        new AppError(
                            'Invalid file type must be ZIP or RAR',
                            400
                        ),
                        false
                    )
                }
            } else {
                // Check image file
                if (file.mimetype.startsWith('image')) {
                    // Set folder destination
                    fileDestination = `./public/uploads/${folderName}`
                    // Multer callback function
                    cb(null, fileDestination)
                } else {
                    // Throw eror by callback function
                    cb(
                        // Returning error message with status code
                        new AppError(
                            'Not an image! Please upload only images',
                            400
                        ),
                        false
                    )
                }
            }
        },
        filename: (req, file, cb) => {
            // Generate unique file name
            const uniqueFileName = crypto.randomBytes(5).toString('hex')
            // Get file extension from filename
            const extension = file.originalname.split('.').pop()

            // Make directory
            fs.mkdir(fileDestination, { recursive: true }, async (err) => {
                if (err) return false

                // Multer callback function
                cb(null, `${file.fieldname}-${uniqueFileName}.${extension}`)
            })
        },
    })

    // Just return to the request
    return multer({ storage: storage })
}

// The memory storage engine stores the files in memory as Buffer objects
exports.memoryStorage = () => {
    // Multer middleware buffer object
    const multerStorage = multer.memoryStorage()
    const multerFilter = (req, file, cb) => {
        // Check image
        if (file.mimetype.startsWith('image')) {
            // Multer middleware callback function
            cb(null, true)
        } else {
            cb(
                // Returning error message with status code
                new AppError('Not an image! Please upload only images', 400),
                false
            )
        }
    }

    const maxSize = 1024 * 1024 // 1MB
    // Return buffer object for server request
    return multer({
        storage: multerStorage,
        fileFilter: multerFilter,
        limits: { fileSize: maxSize },
    })
}

// Upload file & Resize image
exports.uploadAndResizeImage = async (option, file) => {
    // Generate unique file name
    const uniqueFileName = `${crypto.randomBytes(5).toString('hex')}.jpeg`
    // File destination
    const fileDestination = `./${option.dirName}/${uniqueFileName}`

    // Set file path
    // Because buffer file object does not have proper file path
    file.path = fileDestination
    // Make directory
    fs.mkdir(`./${option.dirName}`, { recursive: true }, async (err) => {
        if (err) return false

        // Resize & Convert image
        await sharp(file.buffer)
            .resize(option.imageWidth, option.imageHeight)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(fileDestination)
    })

    // Just return the filename
    return uniqueFileName
}

// Delete a single file
exports.deleteSingleFile = async (fileLink) => {
    await deleteFile(fileLink)
}

// Delete multiple files one by one
exports.deleteMultipleFiles = async (filesArray) => {
    await Promise.all(
        // Delete one by one
        filesArray.map(async (fileLink) => {
            await deleteFile(fileLink)
        })
    )
}

// Delete currently uploaded files when error occurred
exports.deleteFilesWhenError = async (files, type) => {
    // For single file
    if (type === 'single' && files.path) {
        await waitForFileDelete(files.path)
    }

    // For multiple files
    if (type === 'multiple') {
        // Get value of files array objects
        for (const [key, value] of Object.entries(files)) {
            await Promise.all(
                // Delete one by one
                value.map(async (file) => {
                    await waitForFileDelete(file.path)
                })
            )
        }
    }
}
