const mongoose = require('mongoose');
const SystemSchema = require("./schemas/System.js");
const UserSchema = require("./schemas/User.js");
const UserSynthSchema = require("./schemas/UserSynth.js");
const UserCollateralSchema = require("./schemas/UserCollateral.js");
const CollateralSchema = require("./schemas/Collateral.js");
const SynthSchema = require("./schemas/Synth.js");
const UserTradingSchema = require("./schemas/UserTrading.js");
const TradingPoolSchema = require("./schemas/TradingPool.js");

const System = mongoose.model('System', SystemSchema);
const User = mongoose.model('User', UserSchema);
const UserDebt = mongoose.model('UserDebt', UserSynthSchema);
const UserCollateral = mongoose.model('UserCollateral', UserCollateralSchema);
const Collateral = mongoose.model('Collateral', CollateralSchema);
const Synth = mongoose.model('Synth', SynthSchema);
const UserTrading = mongoose.model('UserTrading', UserTradingSchema);
const TradingPool = mongoose.model('TradingPool', TradingPoolSchema);

async function connect() {    
    await mongoose.connect('mongodb://root:password@localhost:27017/test');
}

module.exports = {System, User, UserDebt, UserCollateral, Collateral, Synth, UserTrading, TradingPool, connect};