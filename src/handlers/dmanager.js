const { SynthConfig } = require('../sync/configs/synth');
const { DebtTrackerConfig, DebtTrackerThruSystemConfig } = require('../sync/configs/debtTracker');
const { getContract, tronWeb, getABI } = require('../utils');
const { syncAndListen } = require('../sync/sync');
const { Synth } = require('../db');

async function _handleNewSynthAsset(decodedData) {
    // get synth from db
    let synth = decodedData.args[0];
    let oracle = tronWeb.address.fromHex(decodedData.args[1]);
    let dManager = await getContract("DebtManager");
    let dAsset = await dManager.methods.assetToDAsset(synth).call();
    // console.log("New Synth:", tronWeb.address.fromHex(synth), "Debt Tracker:", tronWeb.address.fromHex(dAsset), "Oracle:", oracle);
    syncAndListen(SynthConfig(tronWeb.address.fromHex(synth)));

    let debtTracker = DebtTrackerConfig(tronWeb.address.fromHex(dAsset));
    let sync = syncAndListen(debtTracker);
    syncAndListen(DebtTrackerThruSystemConfig());
    //  console.log("Sync",sync)
    let priceOracle = await tronWeb.contract().at(oracle);
    let price = (await priceOracle['latestAnswer']().call()).toString() / 10 ** 8;
    // console.log("$", price);
    // console.log("debtTracker",debtTracker)

}

async function handleNewSynthAsset(decodedData, arguments) {

    try {
        const asset_address = tronWeb.address.fromHex(decodedData.args[0]);

        let synth = decodedData.args[0];
        ;
        let dManager = await getContract("DebtManager");
        let debtTracker = tronWeb.address.fromHex(await dManager.methods.assetToDAsset(synth).call()) ;
        syncAndListen(SynthConfig(tronWeb.address.fromHex(synth)));
        syncAndListen(DebtTrackerConfig(debtTracker));
        syncAndListen(DebtTrackerThruSystemConfig());

        const isSynthExist = await Synth.findOne({ synth_id: asset_address }).lean();
        if (isSynthExist) {
            console.log("Synth already exist");
            return
        }

        const getSynthDetails = await tronWeb.contract(getABI("DebtTracker"),debtTracker);
        let interestRate = await getSynthDetails['get_interest_rate']().call();
    
        const apy = ((Number(interestRate._hex) / 10 ** 18) + 1) ** (365 * 24 * 3600) - 1 ;

        const getAssetDetails = await tronWeb.contract(getABI("SynthERC20"), asset_address);
        let name = await getAssetDetails['name']().call();
        let symbol = await getAssetDetails['symbol']().call();
        let decimal = await getAssetDetails['decimals']().call();
        
        let oracle = tronWeb.address.fromHex(decodedData.args[1]);
        let interestRateModel =`${decodedData.args[2]}`;
        let priceOracle = await tronWeb.contract().at(oracle);
        let price = (await priceOracle['latestAnswer']().call()).toString() / 10 ** 8;

        let temp = {
            synth_id: asset_address,
            name: name,
            symbol: symbol,
            price: price,
            oracle: oracle,
            interestRateModel: interestRateModel,
            borrowIndex: `${10 ** 18}`,
            debtTracker_id : debtTracker,
            decimal : decimal,
            apy : apy,
            liquidity : '0'
        }
        const createNewSynth = await Synth.create(temp);

    }
    catch (error) {
        console.log(error.message)
    }

}

module.exports = { handleNewSynthAsset }