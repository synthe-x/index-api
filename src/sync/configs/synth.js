const {handleNewOracle: handleNewSynthOracle} = require("../../handlers/synth");
const {getABI} = require("../../utils");

const SynthConfig = (contractAddress) => {
    return {
        contractAddress,
        abi: getABI("Synth"),
        handlers: {
            "NewOracle(address)": handleNewSynthOracle
        }
    }
}

module.exports = {SynthConfig};