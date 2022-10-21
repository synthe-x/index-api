const { Collateral, Synth, System, Sync } = require("../db");



async function getAllCollateral(req, res){
    try{
        const all_collateral  =  await Collateral.find().select({name:1, symbol:1, price:1, coll_address:1, _id:0 , cAsset : 1, decimal : 1, liquidity : 1}).lean();
        return res.status(200).send({status: true, data : all_collateral});
    }
    catch(error){
        console.log("Error @ getAllCollateral", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
   
};

async function getAllSynth(req, res){

    try{
        const all_synth = await Synth.find().select({oracle:0, accrualTimestamp:0, debtTracker_id:0, _id:0, __v : 0, liquidity : 0, createdAt : 0, updatedAt : 0 }).lean();
    
        return res.status(200).send({status: true, data : all_synth});
    }
    catch(error){
        console.log("Error @ getAllSynth", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
    
};

async function getSystemInfo(req, res){
    try{
        let systemInfo = await System.findOne().lean();
        let sync = await Sync.findOne().lean()

        if(!systemInfo){
            systemInfo = {
                minCollateralRatio : '130',
                safeCollateralRatio : '200',
                blockNumber : sync.blockNumber ?? "0"
            }
        }else{
            systemInfo.blockNumber = sync.blockNumber ?? "0"
        }
       

    
        return res.status(200).send({status: true, data : systemInfo});
    }
    catch(error){
        console.log("Error @ getSystemInfo", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
}


module.exports = {getAllCollateral, getAllSynth, getSystemInfo}