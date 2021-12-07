const LicenseFee = require('./../models/licenseFeeModel')
const factory = require('./handlerFactory')

// Doing all operations using handler factory
exports.getAllLicenseFees = factory.getAll(LicenseFee)
exports.getLicenseFee = factory.getOne(LicenseFee)
exports.createLicenseFee = factory.createOne(LicenseFee)
exports.updateLicenseFee = factory.updateOne(LicenseFee)
exports.deleteLicenseFee = factory.deleteOne(LicenseFee)
