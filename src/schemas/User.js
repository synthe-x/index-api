const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id: String,
    collaterals: [String],
    synths: [String],
    trading: [String],
});

module.exports = UserSchema;