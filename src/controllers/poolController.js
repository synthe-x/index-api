const { TradingPool, Synth, PoolSynth, TradingVolume } = require("../db");



const getPoolDetailsById = async function (req, res) {

    try {

        let pool_id = req.params.poolIndex;

        const getPool = await TradingPool.findOne({ pool_id: pool_id }).select({ pool_address: 1, name: 1, symbol: 1, Debt: 1, _id: 0 }).lean();

        return res.status(200).send({ status: true, data: getPool });

    }
    catch (error) {
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};



const getAllPoolDetails = async function (req, res) {

    try {
        let getAllPool = await TradingPool.find().select({ pool_id: 1, pool_address: 1, name: 1, symbol: 1, poolSynth_ids: 1, _id: 0 }).lean();

        for (let i in getAllPool) {

            let synthIds = getAllPool[i].poolSynth_ids;

            let pool_synthBalance = []
            for (let j in synthIds) {

                let poolSynth = await PoolSynth.findById({ _id: synthIds[j] }).select({ synth_id: 1, balance: 1, _id: 0 }).lean();
                let synthDetails = await Synth.findOne({ synth_id: poolSynth.synth_id }).select({ name: 1, symbol: 1, price: 1, _id: 0 }).lean()
                pool_synthBalance.push({ ...poolSynth, ...synthDetails });
            }
            getAllPool[i].poolSynth_ids = pool_synthBalance;

        }
        return res.status(200).send({ status: true, data: getAllPool });
    }
    catch (error) {
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
};




const getUserPoolDetails = async function (req, res) {
    try {

        let user_id = req.params.user_id;

        let allSynth = await Synth.find().select({});

        console.log("allSynth", allSynth);


        const getAllPool = await TradingPool.find().select({ pool_address: 1, name: 1, symbol: 1, Debt: 1, _id: 0 }).lean();
        return res.status(200).send({ status: true, data: getAllPool });
    }
    catch (error) {
        console.log("Error @ getPoolDetailsById", error)
        return res.status(500).send({ msg: error.message, status: false });
    }

};


const getPoolVolumes = async function (req, res) {

    try {

        let pool_id = req.params.pool_id;

        let tradingVol = TradingVolume.find({ pool_id: pool_id }).sort({ dayId: 1 });
        let findPoolSynth = TradingPool.findOne({ pool_id: pool_id });

        let promise = await Promise.all([tradingVol, findPoolSynth]);
        tradingVol = promise[0];
        findPoolSynth = promise[1];

        let dayId = [];
        for (let i in tradingVol) {
            let ele = tradingVol[i].dayId;
            dayId.push(ele)
        }
        dayId  = [...new Set(dayId)]

        let data = [];

        let allSynthInPool = findPoolSynth.poolSynth_ids;

        let promise_synthId = [];
        for (let j in allSynthInPool) {
            let synthId = PoolSynth.findOne({ _id: allSynthInPool[j] });
            promise_synthId.push(synthId);
        }

        promise_synthId = await Promise.all(promise_synthId);

        for (let i in dayId) {

            let obj = {
                dayId: dayId[i]
            };
   
            let promise_synth_trad = []
            for (let j in allSynthInPool) {

                let synthDetails = Synth.findOne({ synth_id: promise_synthId[j].synth_id });
                let daytradingVol = TradingVolume.findOne({ dayId: dayId[i], synth_id: promise_synthId[j].synth_id, pool_id : pool_id });
                promise_synth_trad.push(synthDetails, daytradingVol);

            }

            promise_synth_trad = await Promise.all(promise_synth_trad);
            for (let j in allSynthInPool) {

                let daytradingVol = promise_synth_trad[2 * j + 1];
                let synthDetails = promise_synth_trad[2 * j];

                if (!daytradingVol) {
                   
                    obj[`${synthDetails.symbol}`] = `0`

                } else {
                   
                   obj[`${synthDetails.symbol}`] = `${Number(daytradingVol.amount) / 10**18}`

                  
                }
            }
           

            data.push(obj)
        }

        return res.status(200).send({ status: true, data: data });
    }
    catch (error) {
        console.log("Error @ getPoolVolumes", error)
        return res.status(500).send({ msg: error.message, status: false });
    }
}



module.exports = { getAllPoolDetails, getPoolDetailsById, getUserPoolDetails, getPoolVolumes };