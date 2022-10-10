const { SynthConfig } = require('../sync/configs/synth');
const { DebtTrackerConfig } = require('../sync/configs/debtTracker');
const { getContract, tronWeb } = require('../utils');
const {syncAndListen} = require('../sync/sync');

async function handleNewSynthAsset(decodedData) {
    // get synth from db
    let synth = decodedData.args[0];
    let oracle = tronWeb.address.fromHex(decodedData.args[1]);
    let dManager = await getContract("DebtManager");
    let dAsset = await dManager.methods.assetToDAsset(synth).call();
    console.log("New Synth:", tronWeb.address.fromHex(synth), "Debt Tracker:", tronWeb.address.fromHex(dAsset), "Oracle:", oracle);
    syncAndListen(SynthConfig(tronWeb.address.fromHex(synth)));
    syncAndListen(DebtTrackerConfig(tronWeb.address.fromHex(dAsset)));
    let priceOracle = await tronWeb.contract().at(oracle);
    let price = (await priceOracle['latestAnswer']().call()).toString()/10**8;
    console.log("$", price);
    
}

module.exports = {handleNewSynthAsset}