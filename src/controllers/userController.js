const { User, UserCollateral, Deposit, Withdraw, Collateral, UserDebt, Borrow, Repay, Synth, UserTrading, TradingPool, System } = require("../db");
const { tronWeb, getABI, getContract } = require("../utils");



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
                    // user_id: userSynth_detail.user_id,
                    // synth_id: userSynth_detail.synth_id,
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
                    const borrow_detail = await Borrow.findOne({ _id: borrow[j] }).select({ asset: 1, _id: 0, amount: 1 }).lean();
                    _borrow.push(borrow_detail);
                };

                for (let j in repay) {
                    const repay_detail = await Repay.findOne({ _id: repay[j] }).select({ asset: 1, _id: 1, amount: 1 }).lean();
                    _repay.push(repay_detail);
                }
                _synth.borrow = _borrow;
                _synth.repay = _repay;

                synths_details.push(_synth);
            };

            return res.status(200).send({status : true, data : synths_details})

        }

        const getPoolDetailsOfUser = await UserTrading.findOne({ user_id: user_id, pool_id: pool_id }).select({ createdAt : 0, updatedAt : 0, __v : 0, _id : 0, pool_id : 0, txn_id : 0, block_number : 0, block_timestamp : 0 }).lean();

        const getPoolDetials = await TradingPool.findOne({pool_id : pool_id}).select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0 , txn_id : 0, block_number : 0, block_timestamp : 0}).lean();
        getPoolDetailsOfUser.pool = getPoolDetials;

        let synth_id = getPoolDetailsOfUser.asset_id;
        const getAssetDetails = await Synth.findOne({synth_id : synth_id}).select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0, synth_id : 0, txn_id : 0, block_number : 0, block_timestamp : 0 }).lean();
        getPoolDetailsOfUser.asset = getAssetDetails
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
                const deposit_detail = await Deposit.findOne({ _id: deposit[j] }).select({ asset: 1, _id: 0, amount: 1 }).lean();
                _deposit.push(deposit_detail);
            };

            for (let j in withdraw) {
                const withdraw_detail = await Withdraw.findOne({ _id: withdraw[j] }).select({ asset: 1, _id: 0, amount: 1 }).lean();
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
};


async function getUserAll(req, res){

    try{

        const user_id = req.params.user_id;
       
        const userCollaterals = await UserCollateral.find({user_id : user_id}).select({balance:1, collateral: 1, _id:0}).lean();

        let totalCollateralBalance = 0;
        for(let i in userCollaterals){
            
            let cManager = await getContract("CollateralManager");
            let CAsset  = await cManager.methods.assetToCAsset(userCollaterals[i].collateral).call()
            let Oracle = await tronWeb.contract(getABI("CollateralERC20"), CAsset);
            let col_price = (await Oracle['get_price']().call()).toString() / 10 ** 8;
            let balance = (Number(userCollaterals[i].balance) / 10**18 ) * col_price;
            totalCollateralBalance += balance
        };

    
        const userDebts = await UserDebt.find({user_id : user_id}).select({principal:1, synth_id: 1,interestIndex:1, _id:0}).lean();

        let totalPrincipal = 0 ;
        let yearly_interest_amount  = 0;
        for(let i in userDebts){
            const synth = await Synth.findOne({synth_id : userDebts[i].synth_id }).select({borrowIndex:1,oracle : 1, debtTracker_id : 1, _id : 0}).lean();

            let priceOracle = await tronWeb.contract().at(synth.oracle);
            let price = (await priceOracle['latestAnswer']().call()).toString() / 10 ** 8;
            // geting interest
            const getAssetDetails = await tronWeb.contract(getABI("DebtTracker"), synth.debtTracker_id);
            let interestRate = await getAssetDetails['get_interest_rate']().call();
            const yearlyInterestRate = (( Number(interestRate[0]._hex) / 10**Number(interestRate[1]._hex) ) + 1)**(365*24*3600) - 1;
                  
            let currentPrincipal = (Number(userDebts[i].principal) / 10**18) * (synth.borrowIndex /userDebts[i].interestIndex ) * price;

            yearly_interest_amount += yearlyInterestRate * currentPrincipal;
            totalPrincipal += currentPrincipal
        }

        let avgInterest = (yearly_interest_amount / totalPrincipal) * 100 ;
        
        const system = await System.findOne().lean();
        let minCollateralRatio;
        if(!system){
            minCollateralRatio = 130;
        }else{
            minCollateralRatio = system.minCollateralRatio;
        }

        let CRatio = (totalCollateralBalance / totalPrincipal ) *100;
        let data = {};
        data.collateralBalance = totalCollateralBalance.toFixed(5);
        data.principalBalance = totalPrincipal.toFixed(5);
        data.cRatio = CRatio.toFixed(5);
        data.minCRatio = `${minCollateralRatio}`;
        data.avgInterest = `${avgInterest.toFixed(5)}`;

       

        return res.status(200).send({ status: true, data: data })


    }
    catch (error) {
        console.log("Error @ userTotalCollateral", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
}

// userTotalCollateral();

module.exports = { userDetails, getPoolDetOfUserById, getUserCollateral, getUserAll }