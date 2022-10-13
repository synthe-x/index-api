


const axios = require('axios');
const ethers = require('ethers');
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

                        let res = event.result;
                        let arr = Object.keys(res);
                        let len = Object.keys(res).length;
                        let args = [];
                        for (let i = 0; i < len / 2; i++) {
                            args.push(res[`${arr[i]}`])
                        };

                        event.args = args;
                        let arguments = {
                            txn_id: event.transaction,
                            block_timestamp: event.timestamp,
                            block_number: event.block,
                            index: 0,
                            address : event.contract
                        }

                        // console.log(event);
                        if (handlers[event["name"]] && event.result != undefined) {
                            handlers[event["name"]](event, arguments)
                        }
                    }
                })
        }
    }
    catch (error) {
        console.log("Error in listening", process.cwd(), error.message)
        return syncAndListen({ contractAddress, abi, handlers })
    }
}


function syncAndListen({ contractAddress, abi, handlers }) {
    let req_url = `https://nile.trongrid.io/v1/contracts/${contractAddress}/transactions?order_by=block_timestamp,asc&limit=50&only_confirmed=true`;
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

            let total_event = [];
            for (let i in abi) {
                if (abi[i].type == "event") {
                    total_event.push(abi[i].name)
                }
            }
            // if(handlers.AccureInterest || handlers.InterestRateModelUpdated){
            //     console.log("Address",contractAddress);
            //     console.log(total_event);
            //     console.log("data",data);
            //     // console.log(resp)
            // }

            if (data) {
                for (let i = 0; i < data.length; i++) {
                    let txn_id = data[i].txID;
                    let block_timestamp = data[i].block_timestamp;
                    let block_number = data[i].blockNumber;
                    let resp_1;
                    let encoded_data;

                    if (txn_id) {
                        resp_1 = await axios.get(`https://nile.trongrid.io/wallet/gettransactioninfobyid?value=${txn_id}`);
                        encoded_data = resp_1.data.log;
                        // console.log("encoded_data",encoded_data)
                    }

                    if (encoded_data) {
                        for (let j = 0; j < encoded_data.length; j++) {
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
                                address: address
                            }

                            const decoded_data = await decode_log_data(data_from_log, modified_topics, iface);

                            if (decoded_data && decoded_data.args != undefined) {

                                // console.log("decoded data", decoded_data.name, decoded_data.args) 
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
            else {
                listen({ contractAddress, abi, handlers })
            }
        }
        catch (error) {
            if (errorCount < 5) {
                sync();
            }
            else {
                console.log(`error`, error.message, error);
            }

        }
    }
}

module.exports = { syncAndListen }