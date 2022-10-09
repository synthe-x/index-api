const mongoose = require('mongoose');
import SystemSchema from "./schemas/System.js";
import UserSchema from "./schemas/User.js";
import UserSynthSchema from "./schemas/UserSynth.js";
import UserCollateralSchema from "./schemas/UserCollateral.js";
import CollateralSchema from "./schemas/Collateral.js";
import SynthSchema from "./schemas/Synth.js";
import UserTradingSchema from "./schemas/UserTrading.js";
import TradingPool from "./schemas/TradingPool.js";

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