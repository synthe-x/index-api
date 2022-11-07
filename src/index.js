const {SystemConfig} = require("./sync/configs/system");
const {syncAndListen} = require("./sync/sync");
const {connect} = require('./db');
const { userDetails, userTotalCollateral } = require("./controllers/userController");
const { getAllCollateral, getAllSynth } = require("./controllers/systemController");



module.exports = {run};