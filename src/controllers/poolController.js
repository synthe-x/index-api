const { TradingPool, Synth, PoolSynth } = require("../db");



const getPoolDetailsById = async function(req, res){

    try{

        let pool_id = req.params.poolIndex;
       
        const getPool = await TradingPool.findOne({pool_id : pool_id}).select({pool_address:1, name:1, symbol:1, Debt:1, _id : 0 }).lean();
       
        return res.status(200).send({status: true, data : getPool});
       
    }
    catch(error){
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};

// "_id": "634e78dbe7532edfab36219d",
// "txn_id": "8fb0ba107a00d7ae5020b475381de78bd91671076a091f1fabe6485c91bc3497",
// "block_number": 30794131,
// "block_timestamp": "1666069992000",
// "pool_id": "5",
// "pool_address": "TF4B65t1FStUQEWJTMMpADChA2tPFajk48",
// "name": "Commodities",
// "symbol": "COMD",
// "poolSynth_ids": [],
// "createdAt": "2022-10-18T09:58:51.912Z",
// "updatedAt": "2022-10-18T09:58:51.912Z",
// "__v": 0,
// "pool_synthBalance": []

const getAllPoolDetails =   async function(req, res){

    try{
        let getAllPool = await TradingPool.find().select({pool_id:1, pool_address : 1, name : 1, symbol : 1,  poolSynth_ids : 1 , _id :0}).lean();
    
        for(let i in getAllPool){

            let synthIds = getAllPool[i].poolSynth_ids;

            let pool_synthBalance = []
            for(let j in synthIds){
                
                let poolSynth = await PoolSynth.findById({_id :synthIds[j] }).select({synth_id : 1, balance : 1, _id : 0}).lean();
                let synthDetails = await Synth.findOne({synth_id : poolSynth.synth_id}).select({name : 1, symbol : 1, price : 1, _id : 0}).lean()
                pool_synthBalance.push({...poolSynth, ...synthDetails});
            }
            getAllPool[i].poolSynth_ids = pool_synthBalance;

        }
        return res.status(200).send({status: true, data : getAllPool});
    }
    catch(error){
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};



const _getAllPoolDetails =   async function(req, res){

    try{
        let getAllPool = await TradingPool.find().select({pool_id:1, pool_address : 1, name : 1, symbol : 1,  poolSynth_ids : 1 , _id :0}).lean();
    
        for(let i in getAllPool){

            let synthIds = getAllPool[i].poolSynth_ids;

            let pool_synthBalance = [];
            let poolSynthPromise = [];

            for(let j in synthIds){
                
                let poolSynth =  PoolSynth.findById({_id :synthIds[j] }).select({synth_id : 1, balance : 1, _id : 0}).lean();
              
                poolSynthPromise.push(poolSynth);
            }

            for(let j in synthIds){
                let synthDetails = await Synth.findOne({synth_id : poolSynth.synth_id}).select({name : 1, symbol : 1, price : 1, _id : 0}).lean()
            }



            getAllPool[i].poolSynth_ids = pool_synthBalance;

        }
        return res.status(200).send({status: true, data : getAllPool});
    }
    catch(error){
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};


const getUserPoolDetails = async function(req, res){
    try{

        // let user_id = req.params.user_id;

        let allSynth = await Synth.find().select({});

        console.log("allSynth", allSynth);


        // const getAllPool = await TradingPool.find().select({pool_address:1, name:1, symbol:1, Debt:1, _id : 0 }).lean();
        return res.status(200).send({status: true, data : "getAllPool"});
    }
    catch(error){
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }

}



module.exports = {getAllPoolDetails, getPoolDetailsById, getUserPoolDetails};