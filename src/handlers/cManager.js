const { CollateralConfig } = require("../sync/configs/collateral");
const { syncAndListen } = require("../sync/sync");
const { getContract, tronWeb } = require("../utils")


async function handleNewCollateralAsset(decodedData){
    // get synth from db
    if(decodedData.args){
        let cManager = await getContract("CollateralManager");
        let cAsset = await cManager.methods.assetToCAsset(decodedData.args[0]).call();
        console.log("-- cAsset --", tronWeb.address.fromHex(cAsset));
        syncAndListen(CollateralConfig(tronWeb.address.fromHex(cAsset)));
    }
}

module.exports = {handleNewCollateralAsset}