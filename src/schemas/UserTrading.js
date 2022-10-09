const mongoose = require("mongoose");

export default UserTrading = new mongoose.Schema({
    id: String,
    tradePool: String,
    debtBalance: Number,
    position: Object
});