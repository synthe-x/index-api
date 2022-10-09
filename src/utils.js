const fs = require("fs");
const tronweb = require("tronweb");

const Deployments = JSON.parse(fs.readFileSync(process.cwd() + `/abi/deployments.json`));

function getABI(name){
    return Deployments["sources"][name]
}

function getAddress(name){
    return Deployments["contracts"][name]["address"]
}

async function getContract(name){
    let contract = Deployments["contracts"][name]["address"];
    return (await tronweb.contract(getABI(contract.source), contract.address));
}

module.exports = {getABI, getAddress, getContract}