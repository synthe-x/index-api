const { TradingPool } = require("../db");



async function getPoolDetailsById(req, res){

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


async function getAllPoolDetails(req, res){

    try{

        const getAllPool = await TradingPool.find().lean();

        return res.status(200).send({status: true, data : getAllPool});

    }
    catch(error){
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};

module.exports = {getAllPoolDetails, getPoolDetailsById};