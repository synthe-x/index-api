const {SystemConfig} = require("./sync/configs/system");
const {syncAndListen} = require("./sync/sync");
const {connect} = require('./db');
const { userDetails, userTotalCollateral } = require("./controllers/userController");
const { getAllCollateral, getAllSynth } = require("./controllers/systemController");



async function run(){
   await  connect();
    syncAndListen(SystemConfig);
//    return res.send({message : "success"})
}
run();
// userTotalCollateral()

// userDetails("TTvnhvkLDqhdXtAGPfCQfPR7ffE8uPVSe6");
// getAllCollateral();
// getAllSynth();
// TTvnhvkLDqhdXtAGPfCQfPR7ffE8uPVSe6

module.exports = {run};