const mongoose = require("mongoose");

export default CollateralSchema = new mongoose.Schema({
    id: String,
    name: String,
    symbol: String,
    price: Number,
    oracle: String,
    minCollateral: Number,
});