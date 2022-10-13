const { TradingPool } = require("../db");



const getPoolDetailsById = async function(req, res){

    try{

        let pool_id = req.params.poolIndex;
       
        const getPool = await TradingPool.findOne({pool_id : pool_id}).lean();
       
        return res.status(200).send({status: true, data : getPool});

    }
    catch(error){
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};


const getAllPoolDetails =   async function(req, res){

    try{
        const getAllPool = await TradingPool.findOne()
        return res.status(200).send({status: true, data : getAllPool});
    }
    catch(error){
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};

module.exports = {getAllPoolDetails, getPoolDetailsById};