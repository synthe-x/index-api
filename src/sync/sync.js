


const axios = require('axios');
const ethers = require('ethers');
const { Sync } = require('../db');
const { tronWeb, getABI } = require("../utils");

function decode_log_data(data, topics, iface) {
    try {
        const result = iface.parseLog({ data, topics });
        return result;
    }
    catch (error) {
        return
    }
};


// async function decode(data, topics) {
//     let abi = getABI("System");
//     const iface = new ethers.utils.Interface(abi);
//     const getData = await decode_log_data(data, topics, iface);
//     console.log(getData);

// }
// decode("0x0000000000000000000000000000000000000000000000000000000000989680", [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     '0x0000000000000000000000000000000000000000000000000000000000000000',
//     '0x000000000000000000000000928c9af0651632157ef27a2cf17ca72c575a4d21'
// ]);


async function listen({ contractAddress, abi, handlers }) {
    try {
        let instance = await tronWeb.contract(abi, contractAddress);
        let total_event = [];
        for (let i in abi) {
            if (abi[i].type == "event") {
                total_event.push(abi[i].name)
            }
        };
        for (let i in total_event) {
            instance[total_event[i]]()
                .watch((err, event) => {
                    if (err) {
                        console.log("Error while watching", process.cwd(), err.message)
                        // return syncAndListen({ contractAddress, abi, handlers });
                    }
                    if (event) {
                        console.log("events",event)
                        syncAndListen({ contractAddress, abi, handlers });
                        /*
                        let res = event.result;
                        let arr = Object.keys(res);
                        let len = Object.keys(res).length;
                        let args = [];
                        for (let i = 0; i < len / 2; i++) {
                            args.push(res[`${arr[i]}`])
                        };
                       
                        event.args = args;
                        console.log(event)
                        let arguments = {
                            txn_id: event.transaction,
                            block_timestamp: event.timestamp,
                            block_number: event.block,
                            index: 0,
                            address : event.contract,
                            from : 1
                        }

                        // console.log(event);
                        if (handlers[event["name"]] && event.result != undefined) {
                            handlers[event["name"]](event, arguments)
                        }*/
                    }
                })
        }
    }
    catch (error) {
        console.log("Error in listening", process.cwd(), error.message)
        return syncAndListen({ contractAddress, abi, handlers })
    }
}


async function syncAndListen({ contractAddress, abi, handlers }) {
    let lastTxnTimestamp;
    let syncDetails = await Sync.findOne();

    if(!syncDetails){
        await Sync.create({lastBlockTimestamp:0});
        lastTxnTimestamp = 0;

    }else{
        lastTxnTimestamp = syncDetails.lastBlockTimestamp;
    }
     
    let req_url = `https://nile.trongrid.io/v1/contracts/${contractAddress}/transactions?order_by=block_timestamp,asc&limit=50&only_confirmed=true&min_block_timestamp=${lastTxnTimestamp}`;
    let isLastPage = false;
    let errorCount = 0;
    

    sync();

    async function sync() {
        try {
            // const isContractExist = await allEvent.findOne({con_add:contractAddress}).sort({"updatedAt":-1}).limit(1);

            // if(isContractExist && isContractExist.req_url != ""){
            //     req_url = isContractExist.req_url;
            // }

            let resp = await axios.get(req_url);

            if (resp.data.meta.links) {
                req_url = resp.data.meta.links.next
            } else {
                isLastPage = true;
            }

            let data = resp.data.data
            const iface = new ethers.utils.Interface(abi);

            // let total_event = [];
            // for (let i in abi) {
            //     if (abi[i].type == "event") {
            //         total_event.push(abi[i].name)
            //     }
            // }
           
            if (await data) {
                for (let i = 0; i < data.length; i++) {
                    let txn_id = data[i].txID;
                    let block_timestamp = data[i].block_timestamp;
                    let block_number = data[i].blockNumber;
                    let resp_1;
                    let encoded_data;

                    if (txn_id) {
                        resp_1 = await axios.get(`https://nile.trongrid.io/wallet/gettransactioninfobyid?value=${txn_id}`);
                        encoded_data = resp_1.data.log;
                       
                        
                    }

                    if (encoded_data) {
                        for (let j = 0; j < encoded_data.length; j++) {
                            lastTxnTimestamp = block_timestamp;
                            const index = j;
                            const topics_from_log = encoded_data[j].topics;
                            const data_from_log = "0x" + encoded_data[j].data;
                            const address = "0x" + encoded_data[j].address
                            let modified_topics = []
                            for (let k = 0; k < topics_from_log.length; k++) {
                                let updated = "0x" + topics_from_log[k];
                                modified_topics.push(updated);
                            };
                            let arguments = {
                                txn_id: txn_id,
                                block_timestamp: block_timestamp,
                                block_number: block_number,
                                index: index,
                                address: address,
                                from : 0
                            }

                            const decoded_data = await decode_log_data(data_from_log, modified_topics, iface);

                            if (decoded_data && decoded_data.args != undefined) {

                                // console.log("decoded data", decoded_data) 
                                if (handlers[decoded_data["name"]]) {
                                    handlers[decoded_data["name"]](decoded_data, arguments)
                                }
                            }
                        }
                    }
                }
            }

            if (isLastPage == false) {
                sync();
            }
            else if(isLastPage == true) {
                await Sync.findOneAndUpdate({},{lastBlockTimestamp : lastTxnTimestamp})
                console.log("Done")
                listen({ contractAddress, abi, handlers });
                return
            }
        }
        catch (error) {
            if (errorCount < 5) {
                sync();
            }
            else {
                await Sync.findOneAndUpdate({},{lastBlockTimestamp : lastTxnTimestamp})
                console.log(`error`, error.message, error);
            }

        }
    }
}

module.exports = { syncAndListen }

// 99993100000