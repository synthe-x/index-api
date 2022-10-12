var express = require('express');
const { getPoolDetailsById, getAllPoolDetails } = require('../src/controllers/poolController');
const { getAllCollateral, getAllSynth } = require('../src/controllers/systemController');
const { getPoolDetOfUserById, getUserCollateral } = require('../src/controllers/userController');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/pool/:poolIndex', getPoolDetailsById);
router.get('/pool/all', getAllPoolDetails);
router.get('/assets/collaterals', getAllCollateral);
router.get('/assets/synths', getAllSynth);
router.get('/user/:user_id/debt/:poolIndex', getPoolDetOfUserById );
router.get('/user/:user_id/collateral', getUserCollateral)

module.exports = router;
