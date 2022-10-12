const mongoose = require("mongoose");

const SystemSchema = new mongoose.Schema({
    id : String,
    address: String,
    minCollateralRatio: Number,
    safeCollateralRatio: Number,
},
{ timestamps: true }
);


module.exports = SystemSchema;
