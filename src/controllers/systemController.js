const { Collateral, Synth } = require("../db");



async function getAllCollateral(req, res){
    try{
        const all_collateral  =  await Collateral.find().select({name:1, symbol:1, price:1, coll_address:1, _id:0 }).lean();
        return res.status(200).send({status: true, data : all_collateral});
    }
    catch(error){
        console.log("Error @ getAllCollateral", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
   
};

async function getAllSynth(req, res){
   
    try{
        const all_synth = await Synth.find().select({oracle:0, accrualTimestamp:0, totalBorrowed:0 ,debtTracker_id:0, _id:0 }).lean();
    
        return res.status(200).send({status: true, data : all_synth});
    }
    catch(error){
        console.log("Error @ getAllSynth", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
    
}


module.exports = {getAllCollateral, getAllSynth}