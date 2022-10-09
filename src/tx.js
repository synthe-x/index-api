const TronWeb = require('tronweb');
// const allEvent = require('../model/allEvent');
const { getCon } = require('./getCon')

const {forkJoin} = require('rxjs');

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
async function getCurrentEventLog({contractAddress, abi, handlers}) {

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
            await watchEvent(total_event[i], { contractAddress, abi, handlers })
            // instance[total_event[i]]()
            // .watch((err, event) => {
            //     if (err) {
            //         console.log("Error1", err.message)
            //         return getCon(contractAddress, abi);
            //     }
            //     if (event) {
            //         if(handlers[event["name"]]){
            //             handlers[event["name"]](event)
            //         }
            //     }
            // })
            
        }
    }
    catch (error) {
        console.log("Error2", error.message)
        return getCon(contractAddress, abi)
    }
}


async function watchEvent( eventName, { contractAddress, abi, handlers }) {
    let _instance = await tronWeb.contract(abi, contractAddress);
    _instance[eventName]().watch((error, event) => {
        console.log(error, event);
    })
}
module.exports = { Hex_to_B58, getCurrentEventLog }