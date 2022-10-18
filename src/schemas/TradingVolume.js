const mongoose = require("mongoose");

const TradingVolumeSchema = new mongoose.Schema({
    dayId : String,
    synth_id: String,
    pool_id: String,
    amount : String

},
    { timestamps: true }
);



module.exports = TradingVolumeSchema;
