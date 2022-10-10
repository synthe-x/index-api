const fs = require("fs");
const TronWeb = require("tronweb");

const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io',
    headers: { "TRON-PRO-API-KEY": 'ebed0d4c-b125-4bea-97bd-9b4f70017593' },
    privateKey: '2186285c3a8a291b6de53ea49b829bf55948c31b0eb2ae23cc77d441d2821fc1'
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