const { User, UserCollateral, Deposit, Withdraw, Collateral, UserDebt, Borrow, Repay, Synth, UserTrading, TradingPool } = require("../db");



async function userDetails(user_id) {

    const userDetails = await User.findOne({ user_id: user_id }).lean();

    if (!userDetails) {
        return
    }

    // User Collateral
    let collateral = userDetails.collaterals;
    let collateral_details = [];

    console.log("len", collateral.length)
    for (let i in collateral) {
        console.log("in");

        const userCol_detail = await UserCollateral.findOne({ _id: collateral[i] }).lean();
        if (!userCol_detail) {
            continue;
        }
        let _collateral = {
            user_id: userCol_detail.user_id,
            collateral: userCol_detail.collateral,
            balance: userCol_detail.balance,
        };

        const collateral_cur_detail = await Collateral.findOne({ coll_address: userCol_detail.collateral }).lean();

        _collateral.name = collateral_cur_detail.name;
        _collateral.symbol = collateral_cur_detail.symbol;
        _collateral.price = collateral_cur_detail.price;
        _collateral.minCollateral = collateral_cur_detail.minCollateral;

        let deposit = userCol_detail.deposits;
        let withdraw = userCol_detail.withdraws;
        let _deposit = [];
        let _withdraw = [];
        for (let j in deposit) {
            const deposit_detail = await Deposit.findOne({ _id: deposit[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
            _deposit.push(deposit_detail);
        };

        for (let j in withdraw) {
            const withdraw_detail = await Withdraw.findOne({ _id: withdraw[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
            _withdraw.push(withdraw_detail);
        }
        _collateral.deposit = _deposit;
        _collateral.withdraw = _withdraw;

        collateral_details.push(_collateral);
    }
    // console.log(collateral_details)

    // User Synth(debt)
    let synth = userDetails.synths;
    let synths_details = [];
    for (let i in synth) {

        const userSynth_detail = await UserDebt.findOne({ _id: synth[i] }).lean();
        if (!userSynth_detail) {
            continue;
        }

        let _synth = {
            user_id: userSynth_detail.user_id,
            synth_id: userSynth_detail.synth_id,
            principal: userSynth_detail.principal,
            interestIndex: userSynth_detail.interestIndex
        };

        const synth_cur_detail = await Synth.findOne({ synth_id: userSynth_detail.synth_id }).lean();

        _synth.name = synth_cur_detail.name;
        _synth.symbol = synth_cur_detail.symbol;
        _synth.price = synth_cur_detail.price;
        _synth.borrowIndex = synth_cur_detail.borrowIndex;
        _synth.interestRateModel = synth_cur_detail.interestRateModel;

        let borrow = userSynth_detail.borrows;
        let repay = userSynth_detail.repays;
        let _borrow = [];
        let _repay = [];

        for (let j in borrow) {
            const borrow_detail = await Borrow.findOne({ _id: borrow[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
            _borrow.push(borrow_detail);
        };

        for (let j in repay) {
            const repay_detail = await Repay.findOne({ _id: repay[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
            _repay.push(repay_detail);
        }
        _synth.borrow = _borrow;
        _synth.repay = _repay;

        synths_details.push(_synth);
    }
    // console.log(synths_details)

    // user tradings
    let trading = userDetails.tradings;
    let trading_details = [];

    for (let i in trading) {

        const userTrad_detail = await UserTrading.find({ _id: trading[i] }).lean();
        if (!userTrad_detail) {
            continue;
        }

        console.log("userTrad_detail", userTrad_detail)

        // const collateral_cur_detail = await Collateral.findOne({coll_address : userCol_detail.collateral}).lean();

    }

};

async function getPoolDetOfUserById(req, res) {

    try {
        let user_id = req.params.user_id;
        let pool_id = req.params.poolIndex;
        console.log("pool",pool_id)
        if (pool_id == "0") {

            const userDetails = await User.findOne({ user_id: user_id }).lean();

            let synth = userDetails.synths;
            let synths_details = [];
            for (let i in synth) {

                const userSynth_detail = await UserDebt.findOne({ _id: synth[i] }).lean();
                if (!userSynth_detail) {
                    continue;
                }

                let _synth = {
                    user_id: userSynth_detail.user_id,
                    synth_id: userSynth_detail.synth_id,
                    principal: userSynth_detail.principal,
                    interestIndex: userSynth_detail.interestIndex
                };

                const synth_cur_detail = await Synth.findOne({ synth_id: userSynth_detail.synth_id }).lean();

                _synth.name = synth_cur_detail.name;
                _synth.symbol = synth_cur_detail.symbol;
                _synth.price = synth_cur_detail.price;
                _synth.borrowIndex = synth_cur_detail.borrowIndex;
                _synth.interestRateModel = synth_cur_detail.interestRateModel;

                let borrow = userSynth_detail.borrows;
                let repay = userSynth_detail.repays;
                let _borrow = [];
                let _repay = [];

                for (let j in borrow) {
                    const borrow_detail = await Borrow.findOne({ _id: borrow[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
                    _borrow.push(borrow_detail);
                };

                for (let j in repay) {
                    const repay_detail = await Repay.findOne({ _id: repay[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
                    _repay.push(repay_detail);
                }
                _synth.borrow = _borrow;
                _synth.repay = _repay;

                synths_details.push(_synth);
            };

            return res.status(200).send({status : true, data : synths_details})

        }

        const getPoolDetailsOfUser = await UserTrading.findOne({ user_id: user_id, pool_id: pool_id }).lean();

        const getPoolDetials = await TradingPool.findOne({ pool_id: pool_id }).select({ createdAt: -1, updatedAt: -1, __v: -1, _id: -1 });
        getPoolDetailsOfUser.pool = getPoolDetials;
        console.log("res")
        return res.status(200).send({ status: true, data: getPoolDetailsOfUser });

    }
    catch (error) {
        console.log("Error @ getPoolDetOfUserById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};


async function getUserCollateral(req, res) {
    try {
        let user_id = req.params.user_id;

        const userDetails = await User.findOne({ user_id: user_id }).lean();

        if (!userDetails) {
            return
        }

        // User Collateral
        let collateral = userDetails.collaterals;
        let collateral_details = [];

        for (let i in collateral) {

            const userCol_detail = await UserCollateral.findOne({ _id: collateral[i] }).lean();
            if (!userCol_detail) {
                continue;
            }
            let _collateral = {
                user_id: userCol_detail.user_id,
                collateral: userCol_detail.collateral,
                balance: userCol_detail.balance,
            };

            const collateral_cur_detail = await Collateral.findOne({ coll_address: userCol_detail.collateral }).lean();

            _collateral.name = collateral_cur_detail.name;
            _collateral.symbol = collateral_cur_detail.symbol;
            _collateral.price = collateral_cur_detail.price;
            _collateral.minCollateral = collateral_cur_detail.minCollateral;

            let deposit = userCol_detail.deposits;
            let withdraw = userCol_detail.withdraws;
            let _deposit = [];
            let _withdraw = [];
            for (let j in deposit) {
                const deposit_detail = await Deposit.findOne({ _id: deposit[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
                _deposit.push(deposit_detail);
            };

            for (let j in withdraw) {
                const withdraw_detail = await Withdraw.findOne({ _id: withdraw[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
                _withdraw.push(withdraw_detail);
            }
            _collateral.deposit = _deposit;
            _collateral.withdraw = _withdraw;

            collateral_details.push(_collateral);
        };

        return res.status(200).send({ status: true, data: collateral_details })

    }
    catch (error) {
        console.log("Error @ getUserCollateral", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
}

module.exports = { userDetails, getPoolDetOfUserById, getUserCollateral }