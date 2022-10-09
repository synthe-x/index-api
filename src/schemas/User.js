const mongoose = require("mongoose");

export default UserSchema = new mongoose.Schema({
    id: String,
    collaterals: [String],
    synths: [String],
    trading: [String],
});