const mongoose = require('mongoose');

const SystemSchema = require("./schemas/System.js");
const UserSchema = require("./schemas/User.js");
const UserSynthSchema = require("./schemas/UserSynth.js");
const UserCollateralSchema = require("./schemas/UserCollateral.js");
const CollateralSchema = require("./schemas/Collateral.js");
const SynthSchema = require("./schemas/Synth.js");
const UserTradingSchema = require("./schemas/UserTrading.js");
const TradingPoolSchema = require("./schemas/TradingPool.js");
const BorrowSchema = require("./schemas/Borrow");
const DepositSchema = require("./schemas/Deposit");
const RepaySchema = require("./schemas/Repay");
const WithdrawSchema = require("./schemas/Withdraw");
const ExchangeSchema = require('./schemas/Exchange.js');
const poolEnteredSchema = require('./schemas/PoolEntered.js');
const poolExitedSchema = require('./schemas/PoolExited.js');
const SyncSchema = require('./schemas/Sync.js');
const poolSynthSchema = require('./schemas/PoolSynth.js');
const TradingVolumeSchema = require('./schemas/TradingVolume.js');


const System = mongoose.model('System', SystemSchema);
const User = mongoose.model('User', UserSchema);
const UserDebt = mongoose.model('UserDebt', UserSynthSchema);
const UserCollateral = mongoose.model('UserCollateral', UserCollateralSchema);
const Collateral = mongoose.model('Collateral', CollateralSchema);
const Synth = mongoose.model('Synth', SynthSchema);
const UserTrading = mongoose.model('UserTrading', UserTradingSchema);
const TradingPool = mongoose.model('TradingPool', TradingPoolSchema);
const Deposit = mongoose.model('Deposit', DepositSchema);
const Borrow = mongoose.model('Borrow', BorrowSchema);
const Repay = mongoose.model('Repay', RepaySchema);
const Withdraw = mongoose.model('Withdraw', WithdrawSchema);
const Exchange = mongoose.model("Exchange", ExchangeSchema);
const PoolEntered = mongoose.model("PoolEntered", poolEnteredSchema);
const PoolExited = mongoose.model("PoolExited", poolExitedSchema);
const Sync = mongoose.model("Sync", SyncSchema)
const PoolSynth = mongoose.model("PoolSynth", poolSynthSchema)
const TradingVolume = mongoose.model("TradingVolume", TradingVolumeSchema)

require("dotenv").config();

async function connect() {
    mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
}) .then(() => console.log("MongoDb is connected"))
.catch(err => console.log(err))

}


module.exports = { System, User, UserDebt, UserCollateral, Collateral, Synth, UserTrading, TradingPool, connect, Deposit, Borrow, Repay, Withdraw, Exchange, PoolEntered, PoolExited, Sync, PoolSynth, TradingVolume}
