const mongoose = require("mongoose");

const poolSynthSchema = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,  
    pool_address : String,
    synth_id : String,
    balance : String
   
},
{ timestamps: true }
);



module.exports = poolSynthSchema;