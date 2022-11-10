var express = require('express');
const { getPoolDetailsById, getAllPoolDetails, getUserPoolDetails, getPoolVolumes } = require('../src/controllers/poolController');
const { getAllCollateral, getAllSynth, getSystemInfo } = require('../src/controllers/systemController');
const { getPoolDetOfUserById, getUserCollateral, getUserAll, userWalletBalances, getUserDepositWithrawDetails } = require('../src/controllers/userController');
const { SystemConfig } = require('../src/sync/configs/system');
const { syncAndListen } = require('../src/sync/sync');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.get('/pool/index/:poolIndex', getPoolDetailsById);
router.get('/pool/volume/:pool_id', getPoolVolumes);
router.get('/pool/all', getAllPoolDetails);
// router.get('/pool/user/:user_id', getUserPoolDetails);
router.get('/assets/collaterals', getAllCollateral);
router.get('/assets/synths', getAllSynth);
// router.get('/user/:user_id/debt/:poolIndex', getPoolDetOfUserById );
// router.get('/user/:user_id/collateral', getUserCollateral);
// router.get('/user/wallet/balance/:user_id', userWalletBalances);

// router.get('/user/:user_id/all',getUserAll);

router.get('/system', getSystemInfo);
// router.get('/user/deposits/withdraws/history/:userId', getUserDepositWithrawDetails)



module.exports = router;
