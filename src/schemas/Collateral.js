const mongoose = require("mongoose");

const CollateralSchema = new mongoose.Schema({
    id: String,
    name: String,
    symbol: String,
    price: Number,
    oracle: String,
    minCollateral: Number,
});

module.exports = CollateralSchema;