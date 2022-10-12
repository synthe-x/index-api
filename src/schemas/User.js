const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    user_id : String,
    collaterals: [String],
    synths: [String],
    tradings: [String],
},
{ timestamps: true }
);

module.exports = UserSchema;
