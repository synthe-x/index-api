


const axios = require('axios');
const ethers = require('ethers');
const {tronWeb} = require("../utils");

function decode_log_data(data, topics, iface) {
    try {
        const result = iface.parseLog({ data, topics });
        return result;
    }
    catch (error) {
        return
    }
}

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
                        event.args = event.result;
                        console.log(event);
                        if (handlers[event["name"]]) {
                            handlers[event["name"]](event)
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

            if (data) {
                for (let i = 0; i < data.length; i++) {
                    let txn_id = data[i].txID
                    let resp_1;
                    let encoded_data;

                    if (txn_id) {
                        resp_1 = await axios.get(`https://nile.trongrid.io/wallet/gettransactioninfobyid?value=${txn_id}`);
                        encoded_data = resp_1.data.log;
                    }

                    if (encoded_data)
                        for (let j = 0; j < encoded_data.length; j++) {
                            const topics_from_log = encoded_data[j].topics;
                            const data_from_log = "0x" + encoded_data[j].data;
                            let modified_topics = []
                            for (let k = 0; k < topics_from_log.length; k++) {
                                let updated = "0x" + topics_from_log[k];
                                modified_topics.push(updated);
                            };

                            const decoded_data = decode_log_data(data_from_log, modified_topics, iface);

                            if (decoded_data) {
                                if (handlers[decoded_data["name"]]) {
                                    handlers[decoded_data["name"]](decoded_data)
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