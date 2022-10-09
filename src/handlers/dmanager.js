function handleNewSynthAsset(decodedData) {
    // ...
    if(decodedData.args){
        console.log("New Synth Asset: " + decodedData.args);
    } else {
        console.log("Unknown decoded data", decodedData);
    }
}


module.exports = {handleNewSynthAsset}