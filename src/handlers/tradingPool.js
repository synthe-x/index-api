const { TradingPool, PoolEntered, PoolExited, UserTrading, Exchange, User, PoolSynth } = require("../db");
const { tronWeb, getABI } = require("../utils");

async function handleNewTradingPool(decodedData, arguments) {
    try {

        const isDuplicateTxn = await TradingPool.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
                index: arguments.index
            }
        );

        if (isDuplicateTxn) {

            return;
        }

        const pool_address = tronWeb.address.fromHex(decodedData.args[0]);
        const pool_id = Number(decodedData.args[1]);
        let poolDetails = await tronWeb.contract(getABI("TradingPool"), pool_address);

        let name = await poolDetails['name']().call();
        let symbol = await poolDetails['symbol']().call();
        arguments.pool_id = pool_id;
        arguments.pool_address = pool_address;
        arguments.name = name;
        arguments.symbol = symbol;

        TradingPool.create(arguments);


    }
    catch (error) {
        console.log("Error @ handleNewTradingPool", error.message);
    }
}

async function handlePoolEntered(decodedData, arguments) {
    try {

        const isDuplicateTxn = await PoolEntered.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
                index: arguments.index
            }
        );

        if (isDuplicateTxn) {

            return;
        };
        const pool_address = tronWeb.address.fromHex(decodedData.args[0]);
        const findPool_id = await TradingPool.findOne({ pool_address: pool_address }).lean();
        let pool_id;
        if (findPool_id) {
            pool_id = findPool_id.pool_id;
            arguments.pool_id = pool_id
        }
        const user_id = tronWeb.address.fromHex(decodedData.args[1]);
        const asset_id = tronWeb.address.fromHex(decodedData.args[2]);
        const amount = `${Number(decodedData.args[3])}`;

        arguments.pool_address = pool_address;
        arguments.user_id = user_id;
        arguments.asset_id = asset_id;
        arguments.amount = amount;

        await PoolEntered.create(arguments);


        let poolSynth = await PoolSynth.findOne({ pool_address: pool_address, synth_id: asset_id }).lean();
        let currentBalance = Number(poolSynth.balance) + Number(amount)

        await PoolSynth.findOneAndUpdate({ pool_address: pool_address, synth_id: asset_id }, { $set: { balance: currentBalance } });

        let createUserTrading;

        let findUserTrading = await UserTrading.findOne({ pool_address: pool_address, user_id: user_id, asset_id: asset_id });

        if (findUserTrading) {

            let currAmount = Number(findUserTrading.amount) + Number(amount);
            await UserTrading.findOneAndUpdate({ _id: findUserTrading._id }, { $set: { amount: currAmount } })
        }
        else {
            createUserTrading = await UserTrading.create(arguments);
        }


        // update in user
        const findUser = await User.findOne({ user_id: user_id }).lean();

        if (findUser) {
            await User.findOneAndUpdate(
                { user_id: user_id },
                { $addToSet: { tradings: createUserTrading._id.toString() } }
            )
        }
        else {
            let temp = {
                user_id: user_id,
                tradings: createUserTrading._id.toString()
            }

            await User.create(temp);
        }
    }
    catch (error) {
        console.log("Error @ handlePoolEntered", error.message);
    }

}

async function handlePoolExited(decodedData, arguments) {
    try {

        const isDuplicateTxn = await PoolExited.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
                index: arguments.index
            }
        );

        if (isDuplicateTxn) {

            return;
        }
        const pool_address = tronWeb.address.fromHex(decodedData.args[0]);
        const findPool_id = await TradingPool.findOne({ pool_address: pool_address }).lean();
        let pool_id;
        if (findPool_id) {
            pool_id = findPool_id.pool_id;
            arguments.pool_id = pool_id
        }
        const user_id = tronWeb.address.fromHex(decodedData.args[1]);
        const asset_id = tronWeb.address.fromHex(decodedData.args[2]);
        const amount = `${Number(decodedData.args[3])}`;

        arguments.pool_address = pool_address;
        arguments.user_id = user_id;
        arguments.asset_id = asset_id;
        arguments.amount = amount;

        PoolExited.create(arguments);
        

        let poolSynth = await PoolSynth.findOne({ pool_address: pool_address, synth_id: asset_id }).lean();
        let currentBalance = Number(poolSynth.balance) - Number(amount)

        await PoolSynth.findOneAndUpdate({ pool_address: pool_address, synth_id: asset_id }, { $set: { balance: currentBalance } });

        let userTrad = await UserTrading.findOne({ asset_id: asset_id, user_id: user_id, pool_id: pool_id }).lean();
        let currentAmount = Number(userTrad.amount) - Number(amount);

        await UserTrading.findOneAndUpdate(
            { asset_id: asset_id, user_id: user_id, pool_id: pool_id },
            { $set: { amount: currentAmount } },
            { new: true }
        )
    }
    catch (error) {
        console.log("Error @ handlePoolExited", error.message);
    }
}

async function handleExchangeTrading(decodedData, arguments) {
    try {

        const pool_id = Number(decodedData.args[0]);
        const user_id = tronWeb.address.fromHex(decodedData.args[1]);
        const src = tronWeb.address.fromHex(decodedData.args[2]);
        const src_amount = `${Number(decodedData.args[3])}`;
        const dst = tronWeb.address.fromHex(decodedData.args[4]);

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
        Exchange.create(arguments);


        let findUserTrading = await UserTrading.findOne({ user_id: user_id, pool_id: pool_id, asset_id: src });

        let poolSynthSrc = await PoolSynth.findOne({ pool_address: findUserTrading.pool_address, synth_id: src }).lean();

        let currentBalanceSrc = Number(poolSynthSrc.balance) - Number(src_amount);

        await PoolSynth.findOneAndUpdate({ pool_address: findUserTrading.pool_address, synth_id: src }, { $set: { balance: currentBalanceSrc } });

        let poolSynthDst = await PoolSynth.findOne({ pool_address: findUserTrading.pool_address, synth_id: dst }).lean();

        let currentBalanceDst = Number(poolSynthDst.balance) + Number(dst_amount);

        await PoolSynth.findOneAndUpdate({ pool_address: findUserTrading.pool_address, synth_id: dst }, { $set: { balance: currentBalanceDst } });


        let currSrcAmount = Number(findUserTrading.amount) - Number(src_amount);
        await UserTrading.findOneAndUpdate(
            { user_id: user_id, pool_id: pool_id, asset_id: src },
            { $set: { amount: currSrcAmount } },
            { new: true }
        );

        let findDstInUserTrading = await UserTrading.findOne({ user_id: user_id, pool_id: pool_id, asset_id: dst });

        if (findDstInUserTrading) {
            let currSrcAmount = Number(findDstInUserTrading.amount) + Number(dst_amount);
            await UserTrading.findOneAndUpdate(
                { user_id: user_id, pool_id: pool_id, asset_id: dst },
                { $set: { amount: currSrcAmount } },
                { new: true }
            );
        } else {
            let temp = {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp,
                pool_address: findUserTrading.pool_address,
                pool_id: pool_id,
                user_id: user_id,
                amount: dst_amount,
                asset_id: dst
            }
            UserTrading.create(temp)
        }

    }
    catch (error) {
        console.log("Error @ handleExchange", error.message)
    }


}

function handleBorrow(decodedData) {

}

function handleRepay(decodedData) {

}

module.exports = { handleNewTradingPool, handlePoolEntered, handlePoolExited, handleExchangeTrading, handleBorrow, handleRepay }