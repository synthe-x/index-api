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
const WithdrawSchema = require("./schemas/Withdraw")


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



async function connect() {
    mongoose.connect("mongodb+srv://g-2-project-1:MvD9HwLH72zL105K@cluster0.j1yrl.mongodb.net/chainscore-index?retryWrites=true&w=majority", {
    useNewUrlParser: true
}) .then(() => console.log("MongoDb is connected"))
.catch(err => console.log(err))

}


module.exports = { System, User, UserDebt, UserCollateral, Collateral, Synth, UserTrading, TradingPool,connect, Deposit, Borrow, Repay, Withdraw }
