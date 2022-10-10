const mongoose = require("mongoose");

const UserCollateral = new mongoose.Schema({
    id: String,
    collaterals: String,
    balance: Number
});

module.exports = UserCollateral;