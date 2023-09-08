const express = require('express');

const testController = require('../controllers/test');



const router = express.Router(); //router is a middleware

router
  .route('/getContract/:contractAddr')
  .get(testController.getContract)
module.exports = router;

// router
//     .route('/verifiedContract/:contractAddr')
//     .get(testController.verifiedContract)
// module.exports = router;
