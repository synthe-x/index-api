const { Collateral } = require("../db");
const { CollateralConfig } = require("../sync/configs/collateral");
const { syncAndListen } = require("../sync/sync");
const { getContract, tronWeb } = require("../utils")


async function _handleNewCollateralAsset(decodedData, arguments) {
    // get synth from db
    if (decodedData.args) {
        let cManager = await getContract("CollateralManager");
        let cAsset = await cManager.methods.assetToCAsset(decodedData.args[0]).call();
        console.log("-- cAsset --", tronWeb.address.fromHex(cAsset));
        syncAndListen(CollateralConfig(tronWeb.address.fromHex(cAsset)));
    }


};
async function handleNewCollateralAsset(decodedData, arguments) {
    // get synth from db
   
    try {
        const asset_address = tronWeb.address.fromHex(decodedData.args[0]);
        let cManager = await getContract("CollateralManager");
        let cAsset = await cManager.methods.assetToCAsset(decodedData.args[0]).call();
        // console.log("-- cAsset --", tronWeb.address.fromHex(cAsset));
        syncAndListen(CollateralConfig(tronWeb.address.fromHex(cAsset)));

        const isCollExist = await Collateral.findOne({coll_address : asset_address}).lean();
        if(isCollExist){
            console.log("Asset already exist");
            return
        }
   
        if (decodedData.args[0] == "0x0000000000000000000000000000000000000000" ||
        decodedData.args[0] == "0x00000000000000000000000000000000000f54e9") {
            let name = "Tron";
            let symbol = "TRX";
            let oracle = tronWeb.address.fromHex(decodedData.args[1]);
            let priceOracle = await tronWeb.contract().at(oracle);
            let price = (await priceOracle['latestAnswer']().call()).toString() / 10 ** 8;
            let minCollateral = Number(decodedData.args[2]);
            arguments.name = name;
            arguments.symbol = symbol;
            arguments.price = price;
            arguments.oracle = oracle;
            arguments.minCollateral = minCollateral;
            arguments.coll_address = asset_address;
            let creatCollateral = await Collateral.create(arguments);
            
            return;

        }
       
        const getAssetDetails = await tronWeb.contract().at(asset_address);

        let name = await getAssetDetails['name']().call();
       
        let symbol = await getAssetDetails['symbol']().call();

        let decimal = await getAssetDetails['decimals']().call();
        
       
        let oracle = tronWeb.address.fromHex(decodedData.args[1]);
        let minCollateral = Number(decodedData.args[2]);
        
        let priceOracle = await tronWeb.contract().at(oracle);
        let price = (await priceOracle['latestAnswer']().call()).toString() / 10 ** 8;
    
        arguments.name = name;
        arguments.symbol = symbol;
        arguments.price = price;
        arguments.oracle = oracle;
        arguments.minCollateral = minCollateral;
        arguments.coll_address = asset_address;
        arguments.decimal = decimal;

        let creatCollateral = await Collateral.create(arguments);
    
    }
    catch (error) {
        console.log("Error", error.message, error);
    }
};




module.exports = { handleNewCollateralAsset }