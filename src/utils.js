const fs = require("fs");
const TronWeb = require("tronweb");


require("dotenv").config();

const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io',
    headers: { "TRON-PRO-API-KEY": process.env.TRON_PRO_API_KEY },
    privateKey: process.env.TRON_PRIVATE_KEY
});
const Deployments = JSON.parse(fs.readFileSync(process.cwd() + `/abi/deployments.json`));

function getABI(name){
    return Deployments["sources"][name]
}

function getAddress(name){
    return Deployments["contracts"][name]["address"]
}

async function getContract(name){
    let contract = Deployments["contracts"][name];
    let instance = await tronWeb.contract(getABI(contract.source), contract.address)
    return instance
}

module.exports = {getABI, getAddress, getContract, tronWeb}