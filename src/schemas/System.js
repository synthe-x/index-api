const mongoose = require("mongoose");

const SystemSchema = new mongoose.Schema({
    id: String, // 1
    address: String, // contract address
    minCollateralRatio: Number, 
    safeCollateralRatio: Number,
});

module.exports = SystemSchema;