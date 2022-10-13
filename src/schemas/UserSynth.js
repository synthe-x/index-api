const mongoose = require("mongoose");

const UserSynth = new mongoose.Schema({
    borrows : [String],
    repays : [String],
    user_id : String,
    synth_id :String,
    principal: String,
    interestIndex: String
},
{ timestamps: true }
);

module.exports = UserSynth;
