var express = require('express');
const { run } = require('../src');
const { getPoolDetailsById, getAllPoolDetails } = require('../src/controllers/poolController');
const { getAllCollateral, getAllSynth } = require('../src/controllers/systemController');
const { getPoolDetOfUserById, getUserCollateral, getUserAll, userWalletBalances } = require('../src/controllers/userController');
const { SystemConfig } = require('../src/sync/configs/system');
const { syncAndListen } = require('../src/sync/sync');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/pool/index/:poolIndex', getPoolDetailsById);
router.get('/pool/all', getAllPoolDetails);
router.get('/assets/collaterals', getAllCollateral);
router.get('/assets/synths', getAllSynth);
router.get('/user/:user_id/debt/:poolIndex', getPoolDetOfUserById );
router.get('/user/:user_id/collateral', getUserCollateral);
router.get('/user/wallet/balance/:user_id', userWalletBalances);

router.get('/user/:user_id/all',getUserAll)

router.get("/test", run);

module.exports = router;
