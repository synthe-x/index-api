const mongoose = require("mongoose");

export default UserSynth = new mongoose.Schema({
    id: String,
    debt: String,
    principle: Number,
    interestIndex: Number
});