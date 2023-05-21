const express = require('express');
const viewController = require('../controllers/view');
const authController = require('../controllers/auth');

const router = express.Router(); //router is a middleware



router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:id', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLogin);
router.get('/me', authController.protect, viewController.getAccount);
router.post('/update-user-data', authController.protect, viewController.updateUserData);


module.exports = router;