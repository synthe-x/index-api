function handleNewCollateralAsset(decodedData){
    // ...
    if(decodedData.args){
        console.log("New Collateral Asset: " + decodedData.args);
    } else {
        console.log("Unknown decoded data", decodedData);
    }
}

module.exports = {handleNewCollateralAsset}