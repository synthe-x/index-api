const { TradingPool, PoolEntered, PoolExited, UserTrading, Exchange, User, PoolSynth, TradingVolume, Synth } = require("../db");
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

        let name =  poolDetails['name']().call();
        let symbol =  poolDetails['symbol']().call();
        let promise = await Promise.all([name, symbol]);
        name = promise[0];
        symbol = promise[1];
        arguments.pool_id = pool_id;
        arguments.pool_address = pool_address;
        arguments.name = name;
        arguments.symbol = symbol;

        TradingPool.create(arguments);
        console.log("New Trading pool", pool_id)

    }
    catch (error) {
        console.log("Error @ handleNewTradingPool", error);
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

       
        // update pool synth
        let poolSynth = await PoolSynth.findOne({ pool_address: pool_address, synth_id: asset_id }).lean();
        let currentBalance = Number(poolSynth.balance) + Number(amount)

        await PoolSynth.findOneAndUpdate({ pool_address: pool_address, synth_id: asset_id }, { $set: { balance: currentBalance } });

        let createUserTrading;

        let findUserTrading = await UserTrading.findOne({ pool_address: pool_address, user_id: user_id, asset_id: asset_id });

        if (findUserTrading) {

            let currAmount = Number(findUserTrading.amount) + Number(amount);
            createUserTrading = await UserTrading.findOneAndUpdate({ _id: findUserTrading._id }, { $set: { amount: currAmount } })
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
       
        console.log("Pool Entered", amount, pool_id)
    }
    catch (error) {
        console.log("Error @ handlePoolEntered", error);
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


       let findUserTrading = await UserTrading.findOne({ pool_address: pool_address, user_id: user_id, asset_id: asset_id });

        if (findUserTrading) {

            let currAmount = Number(findUserTrading.amount) - Number(amount);
            createUserTrading = await UserTrading.findOneAndUpdate({ _id: findUserTrading._id }, { $set: { amount: currAmount } })
        }
        else {
            arguments.amount = -Number(amount);
            createUserTrading = await UserTrading.create(arguments);
        }


        console.log("Pool Exited", amount, pool_id)
    }
    catch (error) {
        console.log("Error @ handlePoolExited", error);
    }
}

async function handleExchangeTrading(decodedData, arguments) {
    try {


        const isDuplicateTxn = await Exchange.findOne(
            {
                txn_id: arguments.txn_id,
                block_number: arguments.block_number,
                block_timestamp: arguments.block_timestamp
        
            }
        );

        if (isDuplicateTxn) {
            return;
        }
        const pool_id = Number(decodedData.args[0]);
        const user_id = tronWeb.address.fromHex(decodedData.args[1]);
        const src = tronWeb.address.fromHex(decodedData.args[2]);
        const src_amount = `${Number(decodedData.args[3])}`;
        const dst = tronWeb.address.fromHex(decodedData.args[4]);

        let dstOracle =  tronWeb.contract(getABI("SynthERC20"), dst);
        let srcOracle =  tronWeb.contract(getABI("SynthERC20"), src);
        let promise = await Promise.all([dstOracle, srcOracle]);
        dstOracle = promise[0];
        srcOracle = promise[1];
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

       

        // update poolSynth
        let findUserTrading = await TradingPool.findOne({ pool_id : pool_id });

        let poolSynthSrc = await PoolSynth.findOne({ pool_address: findUserTrading.pool_address, synth_id: src }).lean();

        let currentBalanceSrc = Number(poolSynthSrc.balance) - Number(src_amount);

        await PoolSynth.findOneAndUpdate({ pool_address: findUserTrading.pool_address, synth_id: src }, { $set: { balance: currentBalanceSrc } });

        let poolSynthDst = await PoolSynth.findOne({ pool_address: findUserTrading.pool_address, synth_id: dst }).lean();

        let currentBalanceDst = Number(poolSynthDst.balance) + Number(dst_amount);

        await PoolSynth.findOneAndUpdate({ pool_address: findUserTrading.pool_address, synth_id: dst }, { $set: { balance: currentBalanceDst } });

        // update Trading volume

        let dayId = Math.ceil( Number(arguments.block_timestamp) / (24 * 60 * 60 * 1000) );

        let findTradingVol = await TradingVolume.findOne({dayId : dayId, synth_id : dst, pool_id : pool_id});

        if(findTradingVol){
            let currAmount = Number(findTradingVol.amount) + Number(dst_amount);
            await TradingVolume.findOneAndUpdate(
                {dayId : dayId, synth_id : dst},
                {$set : {amount : currAmount}}
            )
        }else{
            let temp = {
                dayId : dayId,
                synth_id : dst,
                amount : dst_amount,
                pool_id : pool_id
            }

            TradingVolume.create(temp)
        }


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

        console.log("Exchanged @ pool", pool_id)

    }
    catch (error) {
        console.log("Error @ handleExchangePool", error)
    }


}

function handleBorrow(decodedData) {

}

function handleRepay(decodedData) {

}

module.exports = { handleNewTradingPool, handlePoolEntered, handlePoolExited, handleExchangeTrading, handleBorrow, handleRepay }