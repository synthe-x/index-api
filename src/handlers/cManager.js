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
   
    try {
       
        const asset_address = tronWeb.address.fromHex(decodedData.args[0]);
        const isCollExist = await Collateral.findOne({ coll_address: asset_address }).lean();
        if (isCollExist) {
            console.log("Asset already exist",asset_address);
            return
        }

       
        let cManager = await getContract("CollateralManager");
        let cAsset = tronWeb.address.fromHex(await cManager.methods.assetToCAsset(decodedData.args[0]).call());
        syncAndListen(CollateralConfig(cAsset));

        const getAssetDetails = await tronWeb.contract().at(asset_address);

        let name = getAssetDetails['name']().call();

        let symbol = getAssetDetails['symbol']().call();

        let decimal = getAssetDetails['decimals']().call();

        let oracle = tronWeb.address.fromHex(decodedData.args[1]);
        let minCollateral = Number(decodedData.args[2]);

        let priceOracle = tronWeb.contract().at(oracle);

        let promise = await Promise.all([name, symbol, decimal, priceOracle]);
        name = promise[0];
        symbol = promise[1];
        decimal = promise[2];
        priceOracle = promise[3]

        let price = (await priceOracle['latestAnswer']().call()).toString() / 10 ** 8;

        arguments.name = name;
        arguments.symbol = symbol;
        arguments.price = price;
        arguments.oracle = oracle;
        arguments.minCollateral = minCollateral;
        arguments.coll_address = asset_address;
        arguments.decimal = decimal;
        arguments.cAsset = cAsset;
        arguments.liquidity = '0';

        Collateral.create(arguments);
        console.log("Collateral added")

    }
    catch (error) {
        console.log("Error @ handleNewCollateralAsset", error.message, error);
    }
};




module.exports = { handleNewCollateralAsset }