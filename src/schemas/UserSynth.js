const mongoose = require("mongoose");

const UserSynth = new mongoose.Schema({
    id: String,
    debt: String,
    principle: Number,
    interestIndex: Number
});

module.exports = UserSynth;