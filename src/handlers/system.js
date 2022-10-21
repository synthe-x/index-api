const { System, User, UserDebt, UserCollateral, Collateral, Synth, UserTrading, TradingPool, connect, Deposit, Borrow, Repay, Withdraw, Exchange, PoolSynth } = require("../db");

const { tronWeb, getABI } = require('../utils')
const Big = require('big.js');
const { getAddress } = require('../utils');
const { handleExchangeTrading } = require("./tradingPool");

const {parseAccureInterest} = require('./synth')


async function handleNewMinCRatio(decodedData, arguments) {
    try {
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
    catch (error) {
        console.log("Error @ handleNewMinCRatio", error)
    }

}

async function handleNewSafeCRatio(decodedData, arguments) {

    try {
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
    catch (error) {
        console.log("Error @ handleNewSafeCRatio", error)
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
            return
        }

        if (pool_id != '0') {
           await handleExchangeTrading(decodedData, arguments)
            return;
        }
       await  parseAccureInterest(arguments.txn_id);
        let dstOracle = tronWeb.contract(getABI("SynthERC20"), dst);
        let srcOracle = tronWeb.contract(getABI("SynthERC20"), src);
        let promise = await Promise.all([dstOracle, srcOracle]);
        dstOracle = promise[0];
        srcOracle = promise[1];
        let dst_price = (await dstOracle['get_price']().call()).toString() / 10 ** 8;
        let src_price = (await srcOracle['get_price']().call()).toString() / 10 ** 8;
        console.log("exchange", src_amount)
        let dst_amount = (src_price * src_amount) / dst_price;
        arguments.pool_id = pool_id;
        arguments.user_id = user_id;
        arguments.src = src;
        arguments.src_amount = src_amount;
        arguments.dst = dst;
        arguments.dst_amount = dst_amount;
        Exchange.create(arguments);

        let srcSynth = await Synth.findOne({synth_id : src});

        let srcTotalBorrow = Number(srcSynth.totalBorrowed) - Number(src_amount);

        await Synth.findOneAndUpdate({ synth_id: src }, { $set: { totalBorrowed: srcTotalBorrow } });

        let dstSynth = await Synth.findOne({synth_id : dst});

        let dstTotalBorrow = Number(dstSynth.totalBorrowed) + Number(dst_amount);

        await Synth.findOneAndUpdate({ synth_id: dst }, { $set: { totalBorrowed: dstTotalBorrow } });


        console.log("Reseve Exchange",)

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
            amount = decodedData.args[2].toString();

        }
        else if (arguments.from == 1) {
            amount = decodedData.args[2].toString();
        }

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

       let accur =  parseAccureInterest(arguments.txn_id);

        let borrow = Borrow.create(arguments);

        // get borrowIndex rate from Synth

        let synth = Synth.findOne({ synth_id: asset }).lean();

        let isUserExist = User.findOne({ user_id: account });

        let isUserSynthExist = UserDebt.findOne({ user_id: account, synth_id: asset }).lean();

       

        let promise = await Promise.all([borrow, synth, isUserExist, isUserSynthExist, accur]);
        borrow = promise[0];
        synth = promise[1];
        isUserExist = promise[2];
        isUserSynthExist = promise[3];

        if (!synth) {
            console.log("synth not found", synth);
            return
        };

        let totalBorrowed = Number(synth.totalBorrowed) + Number(amount);
       
        await Synth.findOneAndUpdate({ synth_id: asset }, { $set: { totalBorrowed: totalBorrowed } })

        const getAssetDetails = await tronWeb.contract(getABI("DebtTracker"), synth.debtTracker_id);
        let interestRate = await getAssetDetails['get_interest_rate']().call();

        const apy = ((Number(interestRate._hex) / 10 ** 18) + 1) ** (365 * 24 * 3600) - 1;

        let borrowIndex = synth.borrowIndex;


        // UserSynth

        let userDebt_id;
        if (isUserSynthExist) {
            const principal = ((Number(isUserSynthExist.principal) * Number(borrowIndex)) / Number(isUserSynthExist.interestIndex)) + Number(amount);
            const updateBorrowing = await UserDebt.findOneAndUpdate(
                { user_id: account, synth_id: asset },
                { $set: { principal: principal, interestIndex: borrowIndex, apy: apy }, $addToSet: { borrows: borrow._id } },
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
                borrows: borrow._id,
                apy: apy
            }

            const creatUserSynth = await UserDebt.create(temp);
            userDebt_id = creatUserSynth._id;
        };

        // UserSchema


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

            User.create(temp);
        }

        console.log("Borrow Amount", amount)
    }
    catch (error) {
        console.log("Error in handleBorrow", process.cwd(), error)
    }


}

async function handleRepay(decodedData, arguments) {

    try {
        const account = tronWeb.address.fromHex(decodedData.args[0]);
        const asset = tronWeb.address.fromHex(decodedData.args[1]);

        let amount;
        if (arguments.from == 0) {
            amount = decodedData.args[2].toString()
        }
        else if (arguments.from == 1) {
            amount = Number(decodedData.args[2]);
        }
        
        arguments.account = account;
        arguments.asset = asset;
        arguments.amount = amount;

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

        
      let = await  parseAccureInterest(arguments.txn_id);
        const repay = await Repay.create(arguments);

        // get borrowIndex rate from Synth
        const synth = await Synth.findOne({ synth_id: asset }).lean();

        if (!synth) {
            return ("synth not found", synth)
        };

        let totalBorrowed = Number(synth.totalBorrowed) - Number(amount);
        await Synth.findOneAndUpdate({ synth_id: asset }, { $set: { totalBorrowed: totalBorrowed } })

        const getAssetDetails = await tronWeb.contract(getABI("DebtTracker"), synth.debtTracker_id);
        let interestRate = await getAssetDetails['get_interest_rate']().call();

        const apy = ((Number(interestRate._hex) / 10 ** 18) + 1) ** (365 * 24 * 3600) - 1;

        let borrowIndex = synth.borrowIndex;

        // User Repay
        const isUserSynthExist = await UserDebt.findOne({ user_id: account, synth_id: asset }).lean();
        let userDebt_id;
        if (isUserSynthExist) {
            const principal = ((Number(isUserSynthExist.principal) * Number(borrowIndex)) / Number(isUserSynthExist.interestIndex)) - amount;
            const updateBorrowing = await UserDebt.findOneAndUpdate(
                { user_id: account, synth_id: asset },
                { $set: { principal: principal, interestIndex: borrowIndex, apy: apy }, $addToSet: { repays: repay._id } },
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
                repays: repay._id,
                apy: apy
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

        console.log("Repay Amount", amount)
    }
    catch (error) {
        console.log("Error in handleRepay", process.cwd(), error)
    }

}

async function handleDeposit(decodedData, arguments) {
    try {
        const account = tronWeb.address.fromHex(decodedData.args[0]);
        const asset = tronWeb.address.fromHex(decodedData.args[1]);

        let amount;
        if (arguments.from == 0) {
            amount = decodedData.args[2].toString();
        }
        else if (arguments.from == 1) {
            amount = Number(decodedData.args[2]);
        }

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

        let deposit = Deposit.create(arguments);

        let collateral = Collateral.findOne({ coll_address: asset }).lean();

        // UserCollateral
        let userCollateralExist = UserCollateral.findOne({ user_id: account, collateral: asset }).lean();

        let promise = await Promise.all([deposit, collateral, userCollateralExist]);
        deposit = promise[0];
        collateral = promise[1];
        userCollateralExist = promise[2];

        let liquidity = Number(collateral.liquidity) + Number(amount);

        await Collateral.findByIdAndUpdate({ _id: collateral._id }, { $set: { liquidity: liquidity } });

        let collateral_id;

        if (userCollateralExist) {
            let new_balance = Number(userCollateralExist.balance) + Number(amount);
            const updateUserCollateral = await UserCollateral.findOneAndUpdate(
                { user_id: account, collateral: asset },
                { $set: { balance: new_balance }, $addToSet: { deposits: deposit._id.toString() } },
                { new: true }
            );
            collateral_id = updateUserCollateral._id.toString();

        }
        else {

            const decimal = collateral.decimal;
            let obj = {
                deposits: deposit._id.toString(),
                collateral: asset,
                balance: amount,
                user_id: account,
                decimal: decimal,
                cAsset: collateral.cAsset
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

            User.create(temp);
        }

        console.log("deposit amount", amount)

    }
    catch (error) {
        console.log("Error in handleDeposit", process.cwd(), error)
    }

}

async function handleWithdraw(decodedData, arguments) {
    try {

        const account = tronWeb.address.fromHex(decodedData.args[0]);
        const asset = tronWeb.address.fromHex(decodedData.args[1]);
        let amount;
        if (arguments.from == 0) {
            amount = decodedData.args[2].toString();
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

        let withdraw = Withdraw.create(arguments);


        let collateral = Collateral.findOne({ coll_address: asset }).lean();

        // UserCollateral
        let userCollateralExist = UserCollateral.findOne({ user_id: account, collateral: asset }).lean();

        let promise = await Promise.all([withdraw, collateral, userCollateralExist]);
        withdraw = promise[0];
        collateral = promise[1];
        userCollateralExist = promise[2];

        let liquidity = Number(collateral.liquidity) - Number(amount);

        let updateColLiq = await Collateral.findByIdAndUpdate({ _id: collateral._id }, { $set: { liquidity: liquidity } });


        let collateral_id;
        if (userCollateralExist) {
            let new_balance = Number(userCollateralExist.balance) - Number(amount);
            const updateUserCollateral = await UserCollateral.findOneAndUpdate(
                { user_id: account, collateral: asset },
                { $set: { balance: new_balance }, $addToSet: { withdraws: withdraw._id.toString() } },
                { new: true }
            );
            collateral_id = updateUserCollateral._id.toString();

        }
        else {

            const decimal = collateral.decimal;
            let obj = {
                withdraws: withdraw._id.toString(),
                collateral: asset,
                balance: -amount,
                user_id: account,
                decimal: decimal,
                cAsset: collateral.cAsset
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

            User.create(temp);
        }

        console.log("Withraw amount", amount)
        return
    }
    catch (error) {
        console.log("Error in handleWithdraw", process.cwd(), error)
    }

}

function handleLiquidate(decodedData) {
    // event Liquidate(address pool, address liquidator, address account, address asset, uint amount);
};

async function _handleSynthEnabledInTradingPool(decodedData, arguments) {
    try {

        // console.log("decodedData", decodedData)
        const isDuplicateTxn = await PoolSynth.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,

            }
        );

        if (isDuplicateTxn) {
            return
        }

        let pool_address = tronWeb.address.fromHex(decodedData.args[0]);

        let arrayOfSynthEnb = decodedData.args[1];
        let poolPromise = [];
        for (let i in arrayOfSynthEnb) {
            let synth_id = tronWeb.address.fromHex(arrayOfSynthEnb[i]);
            arguments.pool_address = pool_address;
            arguments.synth_id = synth_id;
            arguments.balance = '0';
            let createPoolSynth = PoolSynth.create(arguments);
            poolPromise.push(createPoolSynth);
        };

        let promise = await Promise.all(poolPromise);
        let poolSynth_ids = []
        for (let i in promise) {
            let id = promise[i]._id.toString();
            poolSynth_ids.push(id)
        }

        await TradingPool.findOneAndUpdate(
            { pool_address: pool_address },
            { $addToSet: { poolSynth_ids: poolSynth_ids } },
            { new: true }
        );


        return
    }
    catch (error) {
        console.log("Error in handleSynthEnabledInTradingPool", process.cwd(), error)
    }

}
async function handleSynthEnabledInTradingPool(decodedData, arguments) {
    try {
       
       // for new Sync
        const isDuplicateTxn = await PoolSynth.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,

            }
        );

        if (isDuplicateTxn) {
            return
        }

        let pool_address = tronWeb.address.fromHex(decodedData.args[0]);

        let arrayOfSynthEnb = decodedData.args[1].split('\n');
      
        let poolPromise = [];
        for (let i in arrayOfSynthEnb) {
            let synth_id = tronWeb.address.fromHex(arrayOfSynthEnb[i]);
            arguments.pool_address = pool_address;
            arguments.synth_id = synth_id;
            arguments.balance = '0';
            let createPoolSynth = PoolSynth.create(arguments);
            poolPromise.push(createPoolSynth);
        };

        let promise = await Promise.all(poolPromise);
        let poolSynth_ids = []
        for (let i in promise) {
            let id = promise[i]._id.toString();
            poolSynth_ids.push(id)
        }

        await TradingPool.findOneAndUpdate(
            { pool_address: pool_address },
            { $addToSet: { poolSynth_ids: poolSynth_ids } },
            { new: true }
        );


        return
    }
    catch (error) {
        console.log("Error in handleSynthEnabledInTradingPool", process.cwd(), error)
    }

}

module.exports = { handleNewMinCRatio, handleNewSafeCRatio, handleExchange, handleLiquidate, handleBorrow, handleRepay, handleDeposit, handleWithdraw, handleSynthEnabledInTradingPool }
