const { Collateral, Synth } = require("../db");



async function getAllCollateral(req, res){
    try{
        const all_collateral  =  await Collateral.find().lean();
        return res.status(200).send({status: true, data : all_collateral});
    }
    catch(error){
        console.log("Error @ getAllCollateral", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
    

};

async function getAllSynth(req, res){
   

    try{
        const all_synth = await Synth.find().lean();
    
        return res.status(200).send({status: true, data : all_synth});
    }
    catch(error){
        console.log("Error @ getAllSynth", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
    
}


module.exports = {getAllCollateral, getAllSynth}