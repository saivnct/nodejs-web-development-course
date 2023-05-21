const express = require("express");
const reviewController = require("../controllers/review");
const authController = require('./../controllers/auth');
const StaticData = require("../utils/StaticData");


const router = express.Router({ mergeParams: true }); //using mergeParams to get params from parent's route (tourid)

//using param middleware - param middleware is middleware that run only if certain parameters appears in req url
router.param('id', reviewController.checkID);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect, reviewController.createReview);
router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.protect, authController.restrictTo(StaticData.AUTH.Role.admin, StaticData.AUTH.Role.leadGuide), reviewController.updateReview)
    .delete(authController.protect, authController.restrictTo(StaticData.AUTH.Role.admin, StaticData.AUTH.Role.leadGuide), reviewController.deleteReview);

module.exports = router;