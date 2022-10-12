const { System, User, UserDebt, UserCollateral, Collateral, Synth, UserTrading, TradingPool, connect, Deposit, Borrow, Repay, Withdraw } = require("../db");

const { tronWeb } = require('../utils')
const Big = require('big.js');
const { getAddress } = require('../utils');


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

function handleExchange(decodedData) {
    // ...
}

async function handleBorrow(decodedData, arguments) {

    try {
        const account = tronWeb.address.fromHex(decodedData.args[0]);
        const asset = tronWeb.address.fromHex(decodedData.args[1]);
        const amount = Number(decodedData.args[2]._hex)
        arguments.account = account;
        arguments.asset = asset;
        arguments.amount = amount;

        const isDuplicateTxn = await Borrow.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
                index: arguments.index
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
        console.log("synth", synth);
        let borrowIndex;
        if (synth) {
            borrowIndex = synth.borrowIndex;
        } else {
            borrowIndex = 1;
        }

        // UserSynth
        const isUserSynthExist = await UserDebt.findOne({ user_id: account, synth_id: asset }).lean();
        let userDebt_id;
        if (isUserSynthExist) {
            const principal = ((isUserSynthExist.principal * borrowIndex) / isUserSynthExist.interestIndex) + amount;
            const updateBorrowing = await UserDebt.findOneAndUpdate(
                { user_id: account, synth_id: asset },
                { $set: { principal: principal, interestIndex: borrowIndex }, $addToSet :{borrows : borrow._id} },
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
                borrows : borrow._id
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
    const amount = Number(decodedData.args[2]._hex)
    arguments.account = account;
    arguments.asset = asset;
    arguments.amount = amount;

    const isDuplicateTxn = await Repay.findOne(
        {
            txn_id: arguments.txn_id,
            block_number: arguments.block_number,
            block_timestamp: arguments.block_timestamp,
            index: arguments.index
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
    let borrowIndex
    if(synth){
        borrowIndex = synth.borrowIndex;
    }
    else{
        borrowIndex = 1; 
    }
     

    // User Repay
    const isUserSynthExist = await UserDebt.findOne({ user_id: account, synth_id: asset }).lean();
    let userDebt_id;
    if (isUserSynthExist) {
        const principal = ((isUserSynthExist.principal * borrowIndex) / isUserSynthExist.interestIndex) - amount;
        const updateBorrowing = await UserDebt.findOneAndUpdate(
            { user_id: account, synth_id: asset },
            { $set: { principal: principal, interestIndex: borrowIndex }, $addToSet : {repays : repay._id } },
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
            repays : repay._id
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
        const amount = Number(decodedData.args[2]._hex)
        arguments.account = account;
        arguments.asset = asset;
        arguments.amount = amount;

        const isDuplicateTxn = await Deposit.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
                index: arguments.index
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
            const updateUserCollateral = await UserCollateral.findOneAndUpdate(
                { user_id: account, collateral: asset },
                { $inc: { balance: amount }, $addToSet: { deposits: deposit._id.toString() } },
                { new: true }
            );
            collateral_id = updateUserCollateral._id.toString();

            // console.log("updateUserCollateral",updateUserCollateral)
        }
        else {

            let obj = {
                deposits: deposit._id.toString(),
                collateral: asset,
                balance: amount,
                user_id: account
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
        const amount = Number(decodedData.args[2]._hex)
        arguments.account = account;
        arguments.asset = asset;
        arguments.amount = amount;

        const isDuplicateTxn = await Withdraw.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
                index: arguments.index
            }
        );
        console.log("TXN", isDuplicateTxn)
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

        // UserCollateral
        const userCollateralExist = await UserCollateral.findOne({ user_id: account, collateral: asset }).lean();
        let collateral_id;
        if (userCollateralExist) {
            const updateUserCollateral = await UserCollateral.findOneAndUpdate(
                { user_id: account, collateral: asset },
                { $inc: { balance: -amount }, $addToSet: { withdraws: withdraw._id.toString() } },
                { new: true }
            );
            collateral_id = updateUserCollateral._id.toString();

        }
        else {

            let obj = {
                withdraws: withdraw._id.toString(),
                collateral: asset,
                balance: -amount,
                user_id: account
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
