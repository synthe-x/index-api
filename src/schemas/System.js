const mongoose = require("mongoose");

export default SystemSchema = new mongoose.Schema({
    id: String,
    address: String,
    minCollateralRatio: Number,
    safeCollateralRatio: Number,
});