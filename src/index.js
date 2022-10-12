const {SystemConfig} = require("./sync/configs/system");
const {syncAndListen} = require("./sync/sync");
const {connect} = require('./db');
const { userDetails } = require("./controllers/userController");
const { getAllCollateral, getAllSynth } = require("./controllers/systemController");

connect();
// syncAndListen(SystemConfig);

userDetails("TTvnhvkLDqhdXtAGPfCQfPR7ffE8uPVSe6");
// getAllCollateral();
// getAllSynth();
// TTvnhvkLDqhdXtAGPfCQfPR7ffE8uPVSe6