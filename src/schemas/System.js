const mongoose = require("mongoose");

export default SystemSchema = new mongoose.Schema({
    id: String,
    minCollateralRatio: Number,
    safeCollateralRatio: Number,
});