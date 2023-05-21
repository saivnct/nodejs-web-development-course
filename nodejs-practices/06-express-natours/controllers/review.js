const catchAsync = require("../utils/catchAsync");
const ReviewDAO = require("../db/ReviewDAO");
const catchAsyncParam = require("../utils/catchAsyncParam");
const AppError = require("../utils/AppError");

//check ID middleware
exports.checkID = catchAsyncParam(async (req, res, next, val) => {
    const id = val * 1; //trick: convert string to number by * with 1

    console.log(`Review id is: ${val}`);

    const review = await ReviewDAO.getReview(id);

    if (!review) {
        throw new AppError(`not found item with id ${id}`, 404)
    }

    req.review = review;

    next();
});


exports.getAllReviews = catchAsync(async (req, res, next) => {
    // console.log(req.query);

    // Allow nested routes from tours router
    if (!req.query.tourId && req.params.tourId) req.query.tourId = req.params.tourId * 1;

    const {page,pageSize,totalPage,totalItem,reviews} = await ReviewDAO.getAllReviews(req.query);

    // console.log(tours);
    res.status(200).json({
        //200 - OK
        status: 'success',
        page,
        pageSize,
        totalPage,
        totalItem,
        data: {
            reviews
        },
    });
});

exports.createReview = catchAsync(async (req, res, next) => {

    // Allow nested routes from tours router
    if (!req.body.tourId && req.params.tourId) req.body.tourId = req.params.tourId * 1;

    const newReview = Object.assign({}, req.body);
    newReview.userId = req.user.id;

    const currentReview =  await ReviewDAO.getReviewByTourAndUser(newReview.tourId, newReview.userId);
    if (currentReview){
        throw new Error("Cannot add more review to this tour");
    }

    await ReviewDAO.addReview(newReview);

    const review = await ReviewDAO.getReviewByTourAndUser(newReview.tourId, newReview.userId);

    res.status(201).json({
        //201 - Created
        status: 'success',
        data: {
            review,
        },
    });
});

exports.getReview = catchAsync(async (req, res, next) => {
    const review = req.review;

    // console.log(tour);
    res.status(200).json({
        //200 - OK
        status: 'success',
        data: {
            review,
        },
    });
});

exports.updateReview = catchAsync(async (req, res, next) => {
    const id = req.params.id * 1; //trick: convert string to number by * with 1

    delete req.body.tourId;
    delete req.body.userId;

    const updateReview = Object.assign({}, req.body);
    await ReviewDAO.updateReview(
        id,
        updateReview
    );

    const review = await ReviewDAO.getReview(id);

    res.status(200).json({
        //200 - OK
        status: 'success',
        data: {
            review,
        },
    });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const id = req.params.id * 1; //trick: convert string to number by * with 1

    await ReviewDAO.deleteReview(id);

    res.status(204).json({
        //204 - NO CONTENT
        status: 'success',
        data: null,
    });
});