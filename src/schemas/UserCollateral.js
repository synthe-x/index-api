const mongoose = require("mongoose");

export default UserCollateral = new mongoose.Schema({
    id: String,
    collaterals: String,
    balance: Number
});