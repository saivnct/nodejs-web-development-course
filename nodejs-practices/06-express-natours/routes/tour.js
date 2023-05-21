const express = require('express');
const StaticData = require('./../utils/StaticData');
const tourController = require('./../controllers/tour');
const authController = require('./../controllers/auth');
const reviewRouter = require('./review');

const router = express.Router(); //router is a middleware


//using param middleware - param middleware is middleware that run only if certain parameters appears in req url
router.param('id', tourController.checkID);


// POST /tour/1/reviews
// GET /tour/2/reviews
router.use('/:tourId/reviews', reviewRouter);


//alias route - middleware
router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAllTours);


router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo(StaticData.AUTH.Role.leadGuide), tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, authController.restrictTo(StaticData.AUTH.Role.admin, StaticData.AUTH.Role.leadGuide), tourController.updateTour)
  .delete(authController.protect, authController.restrictTo(StaticData.AUTH.Role.admin, StaticData.AUTH.Role.leadGuide), tourController.deleteTour);

// console.log(x);  //test UNCAUGHT EXCEPTION

module.exports = router;
