const {handleNewOracle: handleNewCollateralOracle, handleMinCollateralUpdated} = require("../../handlers/collaterals");
const {getABI} = require("../../utils");

const CollateralConfig = (contractAddress) => {
    return {
        contractAddress,
        abi: getABI("CollateralManager"),
        handlers: {
            "NewOracle": handleNewCollateralOracle,
            "MinCollateralUpdated": handleMinCollateralUpdated
        }
    }
}

module.exports = {CollateralConfig};