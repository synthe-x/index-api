
const { Synth, connect } = require("../db");
const { tronWeb, getABI } = require("../utils");
const ethers = require('ethers');
const axios = require('axios');
function handleNewOracle(decodedData) {

}

function handleNewInterestRateModel(decodedData) {

}

async function handleAccureInterest(decodedData, arguments) {
    try {

        let debtTracker = tronWeb.address.fromHex(arguments.address);
        const findSynth = await Synth.findOne({ debtTracker_id: debtTracker });
        if (!findSynth) {

            return
        }

        if (
            findSynth.totalBorrowed == decodedData.args[1].toString() &&
            findSynth.accrualTimestamp == decodedData.args[0].toString() &&
            findSynth.borrowIndex == decodedData.args[2].toString()
        ) {

            return
        }


        const updateSynth = await Synth.findOneAndUpdate(
            { debtTracker_id: debtTracker },
            {
                $set: {
                    accrualTimestamp: decodedData.args[0].toString(),
                    totalBorrowed: decodedData.args[1].toString(),
                    borrowIndex: decodedData.args[2].toString()
                }
            },
            { new: true }
        );
        console.log("Accure Interest added", debtTracker, decodedData.args[1].toString())
    }
    catch (error) {
        console.log("Error @ AccureInterest", error.message);
    }

}


async function parseAccureInterest(txn_id) {


    let findAllDebtTracker = await Synth.find().select({ debtTracker_id: 1, _id: 0 });

    let allDebtTracker = [];

    for (let i in findAllDebtTracker) {
        allDebtTracker.push(findAllDebtTracker[i].debtTracker_id)
    }

    let resp_1 = await axios.get(`https://nile.trongrid.io/wallet/gettransactioninfobyid?value=${txn_id}`);

    let encoded_data = resp_1.data.log

    if (encoded_data) {

        for (let j = 0; j < encoded_data.length; j++) {

            const topics_from_log = encoded_data[j].topics;
            const data_from_log = "0x" + encoded_data[j].data;
            let address = "0x" + encoded_data[j].address;
            let debtTracker = tronWeb.address.fromHex(address);

            if (allDebtTracker.includes(debtTracker)) {
                let abi = getABI("DebtTracker")
                const iface = new ethers.utils.Interface(abi);

                let modified_topics = []
                for (let k = 0; k < topics_from_log.length; k++) {
                    let updated = "0x" + topics_from_log[k];
                    modified_topics.push(updated);
                };
                const data_from_log = "0x" + encoded_data[j].data
                let arguments = {
                    txn_id: txn_id,
                    block_timestamp: encoded_data[j].blockTimeStamp,
                    block_number: encoded_data[j].blockNumber,
                    index: j,
                    address: debtTracker,

                }

                const decoded_data = await decode_log_data(data_from_log, modified_topics, iface);

                // console.log(decoded_data)

                if (decoded_data && decoded_data.args != undefined) {

                    if (decoded_data.name == "AccureInterest") {
                       await handleAccureInterest(decoded_data, arguments)
                    }
                }

            } else {
                continue;
            }


        }


    }

    return
}


function decode_log_data(data, topics, iface) {
    try {
        const result = iface.parseLog({ data, topics });
        return result;
    }
    catch (error) {
        return
    }
};

module.exports = { handleNewOracle, handleNewInterestRateModel, handleAccureInterest, parseAccureInterest }
