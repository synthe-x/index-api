const TronWeb = require('tronweb');
// const allEvent = require('../model/allEvent');
const { getCon } = require('./getCon')


const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io',
    headers: { "TRON-PRO-API-KEY": 'ebed0d4c-b125-4bea-97bd-9b4f70017593' },
    privateKey: '2186285c3a8a291b6de53ea49b829bf55948c31b0eb2ae23cc77d441d2821fc1'
});

function Hex_to_B58(hex) {
    let res = tronWeb.address.fromHex(hex);
    return res
};


let count = 0;
async function getCurrentEventLog(contractAddress, abi) {

    try {
        let instance = await tronWeb.contract(abi, contractAddress);
        let _fingerprint = "";
        let total_event = [];
        for (let i in abi) {
            if (abi[i].type == "event") {
                total_event.push(abi[i].name)
            }
        };

        for (let i in total_event) {

            instance[total_event[i]]().watch(async (err, event) => {

                if (err) {
                    console.log("Error1", err.message)
                    return getCon(contractAddress, abi);
                }
                if (event) {

                    let arr = Object.keys(event.result);
                    for (let i = arr.length / 2; i < arr.length; i++) {
                        delete event.result[`${arr[i]}`]
                    }
                    let obj = {};
                    obj.name = event.name;
                    obj.txn_id = event.transaction;
                    obj.args = event.result;
                    obj.isCurrent = true;

                    if (event.fingerprint) {
                        _fingerprint = `https://nile.trongrid.io/v1/contracts/${contractAddress}/transactions?limit=50&only_confirmed=true&order_by=block_timestamp,asc&_fingerprint=${event.fingerprint}`;

                    };

                    obj.req_url = _fingerprint;

                    count++;
                    console.log(count)
                    // await allEvent.create(obj);
                }
            });
        }

    }
    catch (error) {
        console.log("Error2", error.message)
        return getCon(contractAddress, abi)
    }


}

module.exports = { Hex_to_B58, getCurrentEventLog }