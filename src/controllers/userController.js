const { User, UserCollateral, Deposit, Withdraw, Collateral, UserDebt, Borrow, Repay, Synth, UserTrading, TradingPool, System, connect } = require("../db");
const { tronWeb, getABI, getContract } = require("../utils");



// async function userDetails(user_id) {

//     const userDetails = await User.findOne({ user_id: user_id }).lean();

//     if (!userDetails) {
//         return
//     }

//     // User Collateral
//     let collateral = userDetails.collaterals;
//     let collateral_details = [];

//     console.log("len", collateral.length)
//     for (let i in collateral) {
//         console.log("in");

//         const userCol_detail = await UserCollateral.findOne({ _id: collateral[i] }).lean();
//         if (!userCol_detail) {
//             continue;
//         }
//         let _collateral = {
//             user_id: userCol_detail.user_id,
//             collateral: userCol_detail.collateral,
//             balance: userCol_detail.balance,
//         };

//         const collateral_cur_detail = await Collateral.findOne({ coll_address: userCol_detail.collateral }).lean();

//         _collateral.name = collateral_cur_detail.name;
//         _collateral.symbol = collateral_cur_detail.symbol;
//         _collateral.price = collateral_cur_detail.price;
//         _collateral.minCollateral = collateral_cur_detail.minCollateral;

//         let deposit = userCol_detail.deposits;
//         let withdraw = userCol_detail.withdraws;
//         let _deposit = [];
//         let _withdraw = [];
//         for (let j in deposit) {
//             const deposit_detail = await Deposit.findOne({ _id: deposit[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
//             _deposit.push(deposit_detail);
//         };

//         for (let j in withdraw) {
//             const withdraw_detail = await Withdraw.findOne({ _id: withdraw[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
//             _withdraw.push(withdraw_detail);
//         }
//         _collateral.deposit = _deposit;
//         _collateral.withdraw = _withdraw;

//         collateral_details.push(_collateral);
//     }
//     // console.log(collateral_details)

//     // User Synth(debt)
//     let synth = userDetails.synths;
//     let synths_details = [];
//     for (let i in synth) {

//         const userSynth_detail = await UserDebt.findOne({ _id: synth[i] }).lean();
//         if (!userSynth_detail) {
//             continue;
//         }

//         let _synth = {
//             user_id: userSynth_detail.user_id,
//             synth_id: userSynth_detail.synth_id,
//             principal: userSynth_detail.principal,
//             interestIndex: userSynth_detail.interestIndex
//         };

//         const synth_cur_detail = await Synth.findOne({ synth_id: userSynth_detail.synth_id }).lean();

//         _synth.name = synth_cur_detail.name;
//         _synth.symbol = synth_cur_detail.symbol;
//         _synth.price = synth_cur_detail.price;
//         _synth.borrowIndex = synth_cur_detail.borrowIndex;
//         _synth.interestRateModel = synth_cur_detail.interestRateModel;

//         let borrow = userSynth_detail.borrows;
//         let repay = userSynth_detail.repays;
//         let _borrow = [];
//         let _repay = [];

//         for (let j in borrow) {
//             const borrow_detail = await Borrow.findOne({ _id: borrow[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
//             _borrow.push(borrow_detail);
//         };

//         for (let j in repay) {
//             const repay_detail = await Repay.findOne({ _id: repay[j] }).select({ txn_id: 1, block_timestamp: 1, amount: 1 }).lean();
//             _repay.push(repay_detail);
//         }
//         _synth.borrow = _borrow;
//         _synth.repay = _repay;

//         synths_details.push(_synth);
//     }
//     // console.log(synths_details)

//     // user tradings
//     let trading = userDetails.tradings;
//     let trading_details = [];

//     for (let i in trading) {

//         const userTrad_detail = await UserTrading.find({ _id: trading[i] }).lean();
//         if (!userTrad_detail) {
//             continue;
//         }

//         console.log("userTrad_detail", userTrad_detail)

//         // const collateral_cur_detail = await Collateral.findOne({coll_address : userCol_detail.collateral}).lean();

//     }

// };

async function getPoolDetOfUserById(req, res) {

    try {
        let user_id = req.params.user_id;
        let pool_id = req.params.poolIndex;
        console.log("pool", pool_id)
        if (pool_id == "0") {

            const userDetails = await User.findOne({ user_id: user_id }).lean();
            if (!userDetails) {
                return res.status(404).send({ status: false, error: "User not found" })
            }

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

                _synth.id = pool_id;
                _synth.name = synth_cur_detail.name;
                _synth.symbol = synth_cur_detail.symbol;
                _synth.price = synth_cur_detail.price;
                // _synth.borrowIndex = synth_cur_detail.borrowIndex;
                // _synth.interestRateModel = synth_cur_detail.interestRateModel;
                _synth.decimal = synth_cur_detail.decimal;
                /*
                let borrow = userSynth_detail.borrows;
                let repay = userSynth_detail.repays;
                let _borrow = [];
                let _repay = [];

                for (let j in borrow) {
                    const borrow_detail =  Borrow.findOne({ _id: borrow[j] }).select({ asset: 1, _id: 0, amount: 1 }).lean();
                    _borrow.push(borrow_detail);
                };

                for (let j in repay) {
                    const repay_detail = Repay.findOne({ _id: repay[j] }).select({ asset: 1, _id: 0, amount: 1 }).lean();
                    _repay.push(repay_detail);
                }

                _borrow = await Promise.all(_borrow);
                _repay = await Promise.all(_repay);
                _synth.borrow = _borrow;
                _synth.repay = _repay;
                */
                synths_details.push(_synth);
            };

            return res.status(200).send({ status: true, data: synths_details })

        }

        const getPoolDetailsOfUser = await UserTrading.findOne({ user_id: user_id, pool_id: pool_id }).select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0, pool_id: 0, txn_id: 0, block_number: 0, block_timestamp: 0 }).lean();

        if (!getPoolDetailsOfUser) {
            return res.status(404).send({ status: false, error: "User trading not found in this pool" });
        }

        const getPoolDetials = await TradingPool.findOne({ pool_id: pool_id }).select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0, txn_id: 0, block_number: 0, block_timestamp: 0 }).lean();

        if (!getPoolDetials) {
            return res.status(404).send({ msg: error.message, error: "Pool not found" });
        }
        getPoolDetailsOfUser.pool = getPoolDetials;

        let synth_id = getPoolDetailsOfUser.asset_id;
        const getAssetDetails = await Synth.findOne({ synth_id: synth_id }).select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0, synth_id: 0, txn_id: 0, block_number: 0, block_timestamp: 0 }).lean();
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
            return res.status(404).send({ status: false, error: "User Not Found " });
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
            _collateral.decimal = collateral_cur_detail.decimal;
            /*
            let deposit = userCol_detail.deposits;
            let withdraw = userCol_detail.withdraws;
            let _deposit = [];
            let _withdraw = [];
            for (let j in deposit) {
                const deposit_detail =  Deposit.findOne({ _id: deposit[j] }).select({ asset: 1, _id: 0, amount: 1 }).lean();
                _deposit.push(deposit_detail);
            };

            for (let j in withdraw) {
                const withdraw_detail =  Withdraw.findOne({ _id: withdraw[j] }).select({ asset: 1, _id: 0, amount: 1 }).lean();
                _withdraw.push(withdraw_detail);
            }
            _deposit = await Promise.all(_deposit);
            _withdraw = await Promise.all(_withdraw);
            _collateral.deposit = _deposit;
            _collateral.withdraw = _withdraw;
            */
            collateral_details.push(_collateral);
        };

        return res.status(200).send({ status: true, data: collateral_details })

    }
    catch (error) {
        console.log("Error @ getUserCollateral", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};


async function _getUserAll(req, res) {

    try {

        const user_id = req.params.user_id;

        const userCollaterals = await UserCollateral.find({ user_id: user_id }).select({ balance: 1, collateral: 1, _id: 0, decimal: 1 }).lean();



        let totalCollateralBalance = 0;
        for (let i in userCollaterals) {

            let cManager = await getContract("CollateralManager");
            let CAsset = await cManager.methods.assetToCAsset(userCollaterals[i].collateral).call()
            let Oracle = await tronWeb.contract(getABI("CollateralERC20"), CAsset);
            let col_price = (await Oracle['get_price']().call()).toString() / 10 ** 8;
            let balance = (Number(userCollaterals[i].balance) / 10 ** Number(userCollaterals[i].decimal)) * col_price;
            console.log("col_balance", balance)
            totalCollateralBalance += balance
        };



        const userDebts = await UserDebt.find({ user_id: user_id }).select({ principal: 1, synth_id: 1, interestIndex: 1, _id: 0 }).lean();

        let totalPrincipal = 0;
        let yearly_interest_amount = 0;

        for (let i in userDebts) {
            const synth = await Synth.findOne({ synth_id: userDebts[i].synth_id }).select({ borrowIndex: 1, oracle: 1, debtTracker_id: 1, _id: 0 }).lean();

            let priceOracle = await tronWeb.contract().at(synth.oracle);
            let price = (await priceOracle['latestAnswer']().call()).toString() / 10 ** 8;
            // geting interest
            const getAssetDetails = await tronWeb.contract(getABI("DebtTracker"), synth.debtTracker_id);
            let interestRate = await getAssetDetails['get_interest_rate']().call();

            const yearlyInterestRate = ((Number(interestRate._hex) / 10 ** 18) + 1) ** (365 * 24 * 3600) - 1;
            // console.log(yearlyInterestRate);

            let currentPrincipal = (Number(userDebts[i].principal) / 10 ** 18) * (synth.borrowIndex / userDebts[i].interestIndex) * price;

            yearly_interest_amount += yearlyInterestRate * currentPrincipal;
            totalPrincipal += currentPrincipal
        }

        let avgInterest = (yearly_interest_amount / totalPrincipal) * 100;

        const system = await System.findOne().lean();
        let minCollateralRatio;

        if (!system) {
            minCollateralRatio = 130;
        } else {
            minCollateralRatio = system.minCollateralRatio;
        }

        let CRatio = (totalCollateralBalance / totalPrincipal) * 100;

        if (totalPrincipal == 0) {
            avgInterest = 0;
            CRatio = Number.MAX_SAFE_INTEGER
        }
        let data = {};
        data.collateralBalance = `${totalCollateralBalance}`;
        data.principalBalance = `${totalPrincipal}`;
        data.cRatio = `${CRatio}`;
        data.minCRatio = `${minCollateralRatio}`;
        data.avgInterest = `${avgInterest}`;



        return res.status(200).send({ status: true, data: data })


    }
    catch (error) {
        console.log("Error @ userTotalCollateral", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};

async function getUserAll(req, res) {

    try {

        const user_id = req.params.user_id;

        const userCollaterals = await UserCollateral.find({ user_id: user_id }).lean();

        let totalCollateralBalance = 0;
        let col_promise = [];
        for (let i in userCollaterals) {

            let Oracle = await tronWeb.contract(getABI("CollateralERC20"), userCollaterals[i].cAsset);
            let col_price = Oracle['get_price']().call();
            col_promise.push(col_price);
        };

        let promiseCol = await Promise.all(col_promise);

        for (let i in userCollaterals) {
            let balance = (Number(userCollaterals[i].balance) / 10 ** Number(userCollaterals[i].decimal)) * (Number(promiseCol[i]) / 10 ** 8);
            totalCollateralBalance += balance
        }

        const userDebts = await UserDebt.find({ user_id: user_id }).select({ principal: 1, synth_id: 1, interestIndex: 1, _id: 0 }).lean();

        let totalPrincipal = 0;
        let yearly_interest_amount = 0;
        let promise_userDebt = [];

        let promise_synth = [];
        for (let i in userDebts) {
            let synth = Synth.findOne({ synth_id: userDebts[i].synth_id }).lean();
            promise_synth.push(synth);
        }

        const promiseSynth = await Promise.all(promise_synth);

        let promise_assetOracle = [];
        for (let i in userDebts) {
            const getAssetDetails = tronWeb.contract(getABI("DebtTracker"), promiseSynth[i].debtTracker_id);
            const priceOracle = tronWeb.contract().at(promiseSynth[i].oracle);
            promise_assetOracle.push(getAssetDetails, priceOracle);
        }

        let promiseAssetOracle = await Promise.all(promise_assetOracle)

        for (let i in userDebts) {

            let interestRate = promiseAssetOracle[2 * i]['get_interest_rate']().call();
            let price = (promiseAssetOracle[2 * i + 1]['latestAnswer']().call());

            promise_userDebt.push(price, interestRate)

        };

        const promiseUserDebt = await Promise.all(promise_userDebt);

        for (let i in userDebts) {
            let price = Number(promiseUserDebt[2 * i]) / 10 ** 8;
            let interestRate = promiseUserDebt[2 * i + 1];
            const yearlyInterestRate = ((Number(interestRate._hex) / 10 ** 18) + 1) ** (365 * 24 * 3600) - 1;

            let currentPrincipal = (Number(userDebts[i].principal) / 10 ** 18) * (promiseSynth[i].borrowIndex / userDebts[i].interestIndex) * price;

            yearly_interest_amount += yearlyInterestRate * currentPrincipal;
            totalPrincipal += currentPrincipal
        }

        let avgInterest = (yearly_interest_amount / totalPrincipal) * 100;

        const system = await System.findOne().lean();
        let minCollateralRatio;

        if (!system) {
            minCollateralRatio = 130;
        } else {
            minCollateralRatio = system.minCollateralRatio;
        }

        let CRatio = (totalCollateralBalance / totalPrincipal) * 100;

        if (totalPrincipal == 0) {
            avgInterest = 0;
            CRatio = Number.MAX_SAFE_INTEGER
        }
        let data = {};
        data.collateralBalance = `${totalCollateralBalance}`;
        data.principalBalance = `${totalPrincipal}`;
        data.cRatio = `${CRatio}`;
        data.minCRatio = `${minCollateralRatio}`;
        data.avgInterest = `${avgInterest}`;

        return res.status(200).send({ status: true, data: data })


    }
    catch (error) {
        console.log("Error @ userTotalCollateral", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
}

// userTotalCollateral();


async function _userWalletBalances(req, res) {
    try {

        const user_id = req.params.user_id;
        let collateral = await Collateral.find().lean();
        let synth = await Synth.find().lean();


        let collaterals = []
        for (let i in collateral) {

            let Oracle = await tronWeb.contract(getABI("CollateralERC20"), collateral[i].coll_address);
            let user_balance = (Oracle['balanceOf'](user_id).call());
            let userColl = UserCollateral.findOne({ collateral: collateral[i].coll_address, user_id: user_id });

            let promise = await Promise.all([
                user_balance, userColl
            ]);
            user_balance = Number(promise[0]);
            userColl = promise[1];

            let amount;
            if (userColl) {
                amount = userColl.balance;
            } else {
                amount = 0;

            }
            let _colateral = {
                name: collateral[i].name,
                symbol: collateral[i].symbol,
                price: collateral[i].price,
                decimal: collateral[i].decimal,
                walletBalance: user_balance,
                amount: amount,
                collateralId: collateral[i].coll_address,
                minCollateral: collateral[i].minCollateral
            }
            collaterals.push(_colateral)

        }


        let synths = [];
        for (let i in synth) {

            const getAssetDetails = await tronWeb.contract(getABI("SynthERC20"), synth[i].synth_id);
            let balance = await getAssetDetails['balanceOf'](user_id).call();

            let userDebt = UserDebt.findOne({ user_id: user_id, synth_id: synth[i].synth_id }).lean();

            let promise = await Promise.all([
                balance, userDebt
            ])

            balance = Number(promise[0]);
            userDebt = promise[1];
            let amount;
            if (!userDebt) {
                amount = 0;
            } else {
                amount = userDebt.principal;
            }

            let _synth = {
                name: synth[i].name,
                symbol: synth[i].symbol,
                price: synth[i].price,
                decimal: synth[i].decimal,
                walletBalance: balance,
                synthId: synth[i].synth_id,
                apy: synth[i].apy
            }
            _synth.amount = amount;

            synths.push(_synth)

        }

        let data = {
            collaterals: collaterals,
            synths: synths
        }

        return res.status(200).send({ status: true, data: data })
    }
    catch (error) {
        console.log("Error @ userWalletBalances", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};

async function userWalletBalances(req, res) {
    try {

        const user_id = req.params.user_id;
        let collateral = await Collateral.find().lean();
        let synth = await Synth.find().lean();


        let collaterals = [];
        let col_promise = [];
        for (let i in collateral) {

            let userColl = UserCollateral.findOne({ collateral: collateral[i].coll_address, user_id: user_id });
            col_promise.push(userColl)
        };

        let synths = [];
        let synth_promise = [];
        for (let i in synth) {

            let userDebt = UserDebt.findOne({ user_id: user_id, synth_id: synth[i].synth_id }).lean();

            synth_promise.push(userDebt)

        };

        let promiseCol = await Promise.all(col_promise);

        for (let i in collateral) {
            userColl = promiseCol[i];

            let amount;
            if (userColl) {
                amount = `${userColl.balance}`;
            } else {
                amount = `0`;

            }

            let _colateral = {
                name: collateral[i].name,
                symbol: collateral[i].symbol,
                price: collateral[i].price,
                decimal: collateral[i].decimal,
                amount: amount,
                id: collateral[i].coll_address,
                minCollateral: `${collateral[i].minCollateral}`,
                liquidity: collateral[i].liquidity
            }
            collaterals.push(_colateral)
        }



        let promiseSynth = await Promise.all(synth_promise);

        for (let i in synth) {

            let userDebt = promiseSynth[i];
            let amount;
            if (userDebt) {
                amount = `${userDebt.principal}`;
            } else {
                amount = `0`;
            }

            let _synth = {
                name: synth[i].name,
                symbol: synth[i].symbol,
                price: synth[i].price,
                decimal: synth[i].decimal,
                id: synth[i].synth_id,
                apy: synth[i].apy,
                amount: amount,
                liquidity: synth[i].totalBorrowed
            }

            synths.push(_synth)
        }


        let data = {
            collaterals: collaterals,
            synths: synths
        }

        return res.status(200).send({ status: true, data: data })
    }
    catch (error) {
        console.log("Error @ userWalletBalances", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};


async function getUserDepositWithrawDetails(req, res) {
    try {


        let userId = req.params.userId ;

        let getCollaterals = await Collateral.find().select({ coll_address: 1, _id: 0 }).lean();

        let deposits = {};
        let withdraws = {};
        for (let i in getCollaterals) {

            let getUserDeposits = await Deposit.find({ account: userId, asset: getCollaterals[i].coll_address }).sort({ block_timestamp: 1 }).select({ block_timestamp: 1, amount: 1, _id: 0 }).lean();

            let getUserWithdraws = await Withdraw.find({ account: userId, asset: getCollaterals[i].coll_address }).sort({ block_timestamp: 1 }).select({ block_timestamp: 1, amount: 1, _id: 0 }).lean();

            let updatedWithdraws = []
            for (let i in getUserWithdraws) {

                updatedWithdraws.push({
                    block_timestamp: getUserWithdraws[i].block_timestamp,
                    amount: -getUserWithdraws[i].amount
                })

            }

            deposits[`${getCollaterals[i].coll_address}`] = getUserDeposits;
            withdraws[`${getCollaterals[i].coll_address}`] = updatedWithdraws;
        }

        let data = []
        for (let i in getCollaterals) {

            let merge = [...deposits[`${getCollaterals[i].coll_address}`], ...withdraws[`${getCollaterals[i].coll_address}`]];

            merge = merge.sort((a, b) => a.block_timestamp - b.block_timestamp);

            let result = [];
            let currAmount = 0;

            for (let i in merge) {

                currAmount += Number(merge[i].amount);
                result.push({
                    block_timestamp: merge[i].block_timestamp,
                    amount: currAmount
                })
            };

            data.push(
                {
                    collateralAddress: `${getCollaterals[i].coll_address}`,
                    records: result
                }
            )

        }

        return res.status(200).send({ status: true, data: data })


    }
    catch (error) {
        console.log("Error @ getUserDepositWithrawDetails", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
}




module.exports = { getPoolDetOfUserById, getUserCollateral, getUserAll, userWalletBalances, getUserDepositWithrawDetails }