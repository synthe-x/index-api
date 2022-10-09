function handleNewTradingPool(decodedData){
    if(decodedData.args){
        console.log("New Trading Pool: " + decodedData.args);
    } else {
        console.log("Unknown decoded data", decodedData);
    }
}

function handlePoolEntered(decodedData){

}

function handlePoolExited(decodedData){

}

function handleExchange(decodedData){

}

function handleBorrow(decodedData) {

}

function handleRepay(decodedData) {

}

module.exports = {handleNewTradingPool, handlePoolEntered, handlePoolExited, handleExchange, handleBorrow, handleRepay}