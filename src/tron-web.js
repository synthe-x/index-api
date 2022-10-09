


const axios = require('axios');

const ethers = require('ethers');
// const allEvent = require('../model/allEvent');
const { getABI, getAddress } = require('./utils');
const {getCurrentEventLog} = require("./tx");

// decode_log_data(data,topics)
function decode_log_data(data,topics,iface){
    try{
        const result =  iface.parseLog({ data, topics });
        return result;
    }
    catch(error){
        // console.log("Error from decode_log_data", error.message)
        return 
    }
    
}

const {handleNewCollateralAsset} = require('./handlers/cManager');
const {handleNewSynthAsset} = require('./handlers/dManager');


const _handlers = {
    "NewSynthAsset(address,address,address)": handleNewSynthAsset,
}

let count = 0;
function ContractTransaction (contractAddress, abi, handlers = _handlers){
    let req_url = `https://nile.trongrid.io/v1/contracts/${contractAddress}/transactions?order_by=block_timestamp,asc&limit=50&only_confirmed=true`;

    let isLastPage = false;
    let errorCount = 0;
   
    _getContractTransection();
   
   async function _getContractTransection(){
        try{
            // const isContractExist = await allEvent.findOne({con_add:contractAddress}).sort({"updatedAt":-1}).limit(1);

            // if(isContractExist && isContractExist.req_url != ""){
            //     req_url = isContractExist.req_url;
            // }

            let resp  =  await axios.get(req_url);

            if(resp.data.meta.links){
                req_url = resp.data.meta.links.next
            }else{
                isLastPage = true;
            }
           
            let data = resp.data.data
            const iface = new ethers.utils.Interface(abi);

            let total_event = [];
            for(let i in abi){
                if(abi[i].type == "event"){
                    total_event.push(abi[i].name)
                }
            }
    
            if(data){               
                for(let i = 0; i < data.length; i++){
                    let txn_id = data[i].txID
                    let resp_1;
                    let  encoded_data;
                    
                    // const isTxnExist = await allEvent.findOne({txn_id: txn_id});
                    
                    // if(isTxnExist){
                    //     continue;
                    // }
                    
                    if(txn_id){   
                        resp_1  =  await axios.get(`https://nile.trongrid.io/wallet/gettransactioninfobyid?value=${txn_id}`);
                        encoded_data = resp_1.data.log;
                    }
                        
                             
                    if(encoded_data)
                    for(let j = 0; j <encoded_data.length; j++ ){
                        count++
                        const topics_from_log = encoded_data[j].topics;
                        const data_from_log = "0x"+encoded_data[j].data;
                        let modified_topics = []
                        for(let k = 0; k < topics_from_log.length; k++){
                            let updated = "0x"+topics_from_log[k];
                            modified_topics.push(updated);
                        };
                       
                        const decoded_data = decode_log_data( data_from_log, modified_topics,iface);
                        
                         if(decoded_data){
                            if(handlers[decoded_data["signature"]]){
                                handlers[decoded_data["signature"]](decoded_data)
                            }

                            // if(total_event.includes(decoded_data.name)){
                            //     let arr = [];
                            //     let argsLength = decoded_data.args.length;

                            //     for(let i = 0 ; i <argsLength; i++){
                            //         arr.push(decoded_data.args[i])
                            //     }

                            //     let obj = {};
                            //         if(decoded_data.name){
                            //             obj.name = decoded_data.name;
                            //         }
                            //         if(decoded_data.args){
                            //             obj.args = arr
                            //         }
                            //     obj.txn_id = txn_id;
                            //     obj.con_add = contractAddress;
                            //     obj.req_url = req_url;
                               
                            //     // allEvent.create(obj);
                                                               
                            // }
                         }
                        
                    }   
                }          
            }
    
            if(isLastPage == false){
                _getContractTransection();
            }          
            else{
                getCurrentEventLog(contractAddress,abi)
            }
               
        }
        catch(error){
            if(errorCount < 5){
                _getContractTransection();
            }
            else{
                console.log(`error`, error.message, error);
            }
                   
        }
    }
 
   
}

ContractTransaction(getAddress("System"), getABI("System"))
module.exports = {ContractTransaction}