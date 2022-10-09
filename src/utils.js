import fs from "fs";
import tronweb from "tronweb";

const Deployments = JSON.parse(fs.readFileSync(process.cwd() `./abi/deployments.json`)).abi;
export function getABI(name){
    return Deployments["sources"][name]
}

export async function getContract(name){
    let contract = Deployments["contracts"][name]["address"];
    return (await tronweb.contract(getABI(contract.source), contract.address));
}