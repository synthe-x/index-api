const { System, User, UserDebt, UserCollateral, Collateral, Synth, UserTrading, TradingPool, connect, Deposit, Borrow, Repay, Withdraw, Exchange } = require("../db");

const { tronWeb, getABI } = require('../utils')
const Big = require('big.js');
const { getAddress } = require('../utils');
const { handleExchangeTrading } = require("./tradingPool");


async function handleNewMinCRatio(decodedData, arguments) {

    const minCollateralRatio = Big(Number(decodedData.args[0]._hex)).div(Big(10).pow(18)).toNumber()
    const system = await System.findOne({ id: "1" }).lean();

    if (system) {
        await System.findOneAndUpdate(
            { id: "1" },
            { $set: { minCollateralRatio: minCollateralRatio } },
            { new: true }
        );
    } else {
        const address = await getAddress("System");
        let obj = {
            address: address,
            minCollateralRatio: minCollateralRatio,
            id: "1"
        }
        System.create(obj);

    }
}

async function handleNewSafeCRatio(decodedData, arguments) {

    const safeCollateralRatio = Big(Number(decodedData.args[0]._hex)).div(Big(10).pow(18)).toNumber()
    const system = await System.findOne({ id: "1" }).lean();
    if (system) {
        await System.findOneAndUpdate(
            { id: "1" },
            { $set: { safeCollateralRatio: safeCollateralRatio } },
            { new: true }
        );
    } else {
        const address = await getAddress("System");
        let obj = {
            address: address,
            safeCollateralRatio: safeCollateralRatio,
            id: "1"
        }
        System.create(obj);

    }
}

async function handleExchange(decodedData, arguments) {

    try {

        const pool_id = Number(decodedData.args[0]);
        const user_id = tronWeb.address.fromHex(decodedData.args[1]);
        const src = tronWeb.address.fromHex(decodedData.args[2]);
        const src_amount = `${Number(decodedData.args[3])}`;
        const dst = tronWeb.address.fromHex(decodedData.args[4]);

        const isDuplicateTxn = await Exchange.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
            
            }
        );

        if (isDuplicateTxn) {
            if (isDuplicateTxn.pool_id == pool_id &&
                isDuplicateTxn.user_id == user_id &&
                isDuplicateTxn.src_amount == src_amount) {
                return
            }
            else {
                arguments.index = isDuplicateTxn.index + 1;
            }

        }

        if (pool_id != '0') {
            handleExchangeTrading(decodedData, arguments)
            return;
        }


        let dstOracle = await tronWeb.contract(getABI("SynthERC20"), dst);
        let srcOracle = await tronWeb.contract(getABI("SynthERC20"), src);
        let dst_price = (await dstOracle['get_price']().call()).toString() / 10 ** 8;
        let src_price = (await srcOracle['get_price']().call()).toString() / 10 ** 8;

        let dst_amount = (src_price * src_amount) / dst_price;
        arguments.pool_id = pool_id;
        arguments.user_id = user_id;
        arguments.src = src;
        arguments.src_amount = src_amount;
        arguments.dst = dst;
        arguments.dst_amount = dst_amount;
        await Exchange.create(arguments);

    }
    catch (error) {
        console.log("Error @ handleExchange", error)
    }



}

async function handleBorrow(decodedData, arguments) {

    try {
        const account = tronWeb.address.fromHex(decodedData.args[0]);
        const asset = tronWeb.address.fromHex(decodedData.args[1]);
        let amount;
        if (arguments.from == 0) {
            amount = Number(decodedData.args[2]._hex)
        }
        else if (arguments.from == 1) {
            amount = Number(decodedData.args[2]);
        }
        console.log("Borrow Amount", amount)
        arguments.account = account;
        arguments.asset = asset;
        arguments.amount = amount;

        const isDuplicateTxn = await Borrow.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
            
            }
        );

        if (isDuplicateTxn) {
            if (isDuplicateTxn.account == account &&
                isDuplicateTxn.asset == asset &&
                isDuplicateTxn.amount == amount) {
                return
            }
            else {
                arguments.index = isDuplicateTxn.index + 1;
            }

        }

        const borrow = await Borrow.create(arguments);

        // get borrowIndex rate from Synth

        const synth = await Synth.findOne({ synth_id: asset }).lean();
        if (!synth) {
            console.log("synth not found", synth);
            return
        }

        let borrowIndex = synth.borrowIndex;


        // UserSynth
        const isUserSynthExist = await UserDebt.findOne({ user_id: account, synth_id: asset }).lean();
        let userDebt_id;
        if (isUserSynthExist) {
            const principal = ((Number(isUserSynthExist.principal) * Number(borrowIndex)) / Number(isUserSynthExist.interestIndex)) + amount;
            const updateBorrowing = await UserDebt.findOneAndUpdate(
                { user_id: account, synth_id: asset },
                { $set: { principal: principal, interestIndex: borrowIndex }, $addToSet: { borrows: borrow._id } },
                { new: true }
            );

            userDebt_id = updateBorrowing._id;

        }
        else {
            let temp = {
                user_id: account,
                synth_id: asset,
                principal: amount,
                interestIndex: borrowIndex,
                borrows: borrow._id
            }

            const creatUserSynth = await UserDebt.create(temp);
            userDebt_id = creatUserSynth._id;
        };

        // UserSchema
        const isUserExist = await User.findOne({ user_id: account });

        if (isUserExist) {

            const updateUserDebt = await User.findOneAndUpdate(
                { user_id: account },
                { $addToSet: { synths: userDebt_id } },
                { new: true }
            )
        }
        else {
            let temp = {
                user_id: account,
                synths: userDebt_id
            }

            const createUser = await User.create(temp);
        }
    }
    catch (error) {
        console.log("Error in listening", process.cwd(), error.message)
    }


}

async function handleRepay(decodedData, arguments) {

    const account = tronWeb.address.fromHex(decodedData.args[0]);
    const asset = tronWeb.address.fromHex(decodedData.args[1]);

    let amount;
    if (arguments.from == 0) {
        amount = Number(decodedData.args[2]._hex)
    }
    else if (arguments.from == 1) {
        amount = Number(decodedData.args[2]);
    }

    arguments.account = account;
    arguments.asset = asset;
    arguments.amount = amount;
    console.log("Repay Amount", amount)
    const isDuplicateTxn = await Repay.findOne(
        {
            txn_id: arguments.txn_id,
            block_number: arguments.block_number,
            block_timestamp: arguments.block_timestamp
        }
    );

    if (isDuplicateTxn) {
        if (isDuplicateTxn.account == account &&
            isDuplicateTxn.asset == asset &&
            isDuplicateTxn.amount == amount) {
            return
        }
        else {
            arguments.index = isDuplicateTxn.index + 1;
        }

    }
    const repay = await Repay.create(arguments);

    // get borrowIndex rate from Synth
    const synth = await Synth.findOne({ synth_id: asset }).lean();

    if (!synth) {
        return ("synth not found", synth)
    }

    let borrowIndex = synth.borrowIndex;

    // User Repay
    const isUserSynthExist = await UserDebt.findOne({ user_id: account, synth_id: asset }).lean();
    let userDebt_id;
    if (isUserSynthExist) {
        const principal = ((Number(isUserSynthExist.principal) * Number(borrowIndex)) / Number(isUserSynthExist.interestIndex)) - amount;
        const updateBorrowing = await UserDebt.findOneAndUpdate(
            { user_id: account, synth_id: asset },
            { $set: { principal: principal, interestIndex: borrowIndex }, $addToSet: { repays: repay._id } },
            { new: true }
        )
        userDebt_id = updateBorrowing._id;

    }
    else {
        let temp = {
            user_id: account,
            synth_id: asset,
            principal: -amount,
            interestIndex: borrowIndex,
            repays: repay._id
        }

        const creatUserSynth = await UserDebt.create(temp);
        userDebt_id = creatUserSynth._id;
    }

    // UserSchema
    const isUserExist = await User.findOne({ user_id: account });

    if (isUserExist) {

        const updateUserDebt = await User.findOneAndUpdate(
            { user_id: account },
            { $addToSet: { synths: userDebt_id } },
            { new: true }
        )
    }
    else {
        let temp = {
            user_id: account,
            synths: userDebt_id
        }

        const createUser = await User.create(temp);
    }

}

async function handleDeposit(decodedData, arguments) {
    try {
        const account = tronWeb.address.fromHex(decodedData.args[0]);
        const asset = tronWeb.address.fromHex(decodedData.args[1]);

        let amount;
        if (arguments.from == 0) {
            amount = Number(decodedData.args[2]._hex)
        }
        else if (arguments.from == 1) {
            amount = Number(decodedData.args[2]);
        }
        console.log("deposit amount", amount)
        arguments.account = account;
        arguments.asset = asset;
        arguments.amount = amount;

        const isDuplicateTxn = await Deposit.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
            
            }
        );

        if (isDuplicateTxn) {
            if (isDuplicateTxn.account == account &&
                isDuplicateTxn.asset == asset &&
                isDuplicateTxn.amount == amount) {
                return
            }
            else {
                arguments.index = isDuplicateTxn.index + 1;
            }

        }

        const deposit = await Deposit.create(arguments);

        // UserCollateral
        const userCollateralExist = await UserCollateral.findOne({ user_id: account, collateral: asset }).lean();
        let collateral_id;

        if (userCollateralExist) {
            let new_balance = Number(userCollateralExist.balance) + amount;
            const updateUserCollateral = await UserCollateral.findOneAndUpdate(
                { user_id: account, collateral: asset },
                { $set: { balance: new_balance }, $addToSet: { deposits: deposit._id.toString() } },
                { new: true }
            );
            collateral_id = updateUserCollateral._id.toString();

            // console.log("updateUserCollateral",updateUserCollateral)
        }
        else {
            const collateral = await Collateral.findOne({coll_address : asset}).lean();
            const decimal = collateral.decimal;
            let obj = {
                deposits: deposit._id.toString(),
                collateral: asset,
                balance: amount,
                user_id: account,
                decimal : decimal
            };
            const createUserCollateral = await UserCollateral.create(obj);
            collateral_id = createUserCollateral._id.toString()
            // console.log("createUserCollateral",createUserCollateral)
        }

        // UserSchema
        const isUserExist = await User.findOne({ user_id: account });

        if (isUserExist) {

            const updateUserCollateral = await User.findOneAndUpdate(
                { user_id: account },
                { $addToSet: { collaterals: collateral_id } },
                { new: true }
            )
        }
        else {

            
            let temp = {
                user_id: account,
                collaterals: collateral_id
            }

            const createUser = await User.create(temp);
        }

    }
    catch (error) {
        console.log("Error in listening", process.cwd(), error.message)
    }

}

async function handleWithdraw(decodedData, arguments) {
    try {

        const account = tronWeb.address.fromHex(decodedData.args[0]);
        const asset = tronWeb.address.fromHex(decodedData.args[1]);
        let amount;
        if (arguments.from == 0) {
            amount = Number(decodedData.args[2]._hex)
        }
        else if (arguments.from == 1) {
            amount = Number(decodedData.args[2]);
        }
        arguments.account = account;
        arguments.asset = asset;
        arguments.amount = amount;

        const isDuplicateTxn = await Withdraw.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
    
            }
        );
       
        if (isDuplicateTxn) {

            if (isDuplicateTxn.account == account &&
                isDuplicateTxn.asset == asset &&
                isDuplicateTxn.amount == amount) {
                return
            }
            else {
                arguments.index = isDuplicateTxn.index + 1;
            }

        }

        const withdraw = await Withdraw.create(arguments);

        // get decimals
       

        // UserCollateral
        const userCollateralExist = await UserCollateral.findOne({ user_id: account, collateral: asset }).lean();
        let collateral_id;
        if (userCollateralExist) {
            let new_balance = Number(userCollateralExist.balance) - amount;
            const updateUserCollateral = await UserCollateral.findOneAndUpdate(
                { user_id: account, collateral: asset },
                { $set: { balance: new_balance }, $addToSet: { withdraws: withdraw._id.toString() } },
                { new: true }
            );
            collateral_id = updateUserCollateral._id.toString();

        }
        else {
            const collateral = await Collateral.findOne({coll_address : asset}).lean();
            const decimal = collateral.decimal;
            let obj = {
                withdraws: withdraw._id.toString(),
                collateral: asset,
                balance: -amount,
                user_id: account,
                decimal: decimal
            };
            const createUserCollateral = await UserCollateral.create(obj);
            collateral_id = createUserCollateral._id.toString()

        }

        // UserSchema
        const isUserExist = await User.findOne({ user_id: account });

        if (isUserExist) {

            const updateUserCollateral = await User.findOneAndUpdate(
                { user_id: account },
                { $addToSet: { collaterals: collateral_id } },
                { new: true }
            )
        }
        else {

            let temp = {
                user_id: account,
                collaterals: collateral_id
            }

            const createUser = await User.create(temp);
        }

    }
    catch (error) {
        console.log("Error in listening", process.cwd(), error.message)
    }

}

function handleLiquidate(decodedData) {
    // event Liquidate(address pool, address liquidator, address account, address asset, uint amount);
}

module.exports = { handleNewMinCRatio, handleNewSafeCRatio, handleExchange, handleLiquidate, handleBorrow, handleRepay, handleDeposit, handleWithdraw }
