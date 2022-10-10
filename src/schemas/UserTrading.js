const mongoose = require("mongoose");

const UserTrading = new mongoose.Schema({
    id: String,
    tradePool: String,
    debtBalance: Number,
    position: Object
});

module.exports = UserTrading;