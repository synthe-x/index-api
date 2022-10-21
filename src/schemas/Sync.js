const mongoose = require("mongoose");

const SyncSchema = new mongoose.Schema({
    lastBlockTimestamp : {type:Number, default:0},
    blockNumber : Number
   
},
{ timestamps: true }
);

module.exports = SyncSchema;