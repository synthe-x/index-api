const { Collateral, Synth } = require("../db");



async function getAllCollateral(){

    const all_collateral  =  await Collateral.find().lean();
    console.log("All Collateral",all_collateral)

};

async function getAllSynth(){
    const all_synth = await Synth.find().lean();
    console.log("All Synth",all_synth);
}


module.exports = {getAllCollateral, getAllSynth}