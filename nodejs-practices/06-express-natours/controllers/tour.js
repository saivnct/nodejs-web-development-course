const catchAsync = require('../utils/catchAsync');
const catchAsyncParam = require('../utils/catchAsyncParam');
const AppError = require('../utils/AppError');
const TourDAO = require('../db/TourDAO');



//check ID middleware
exports.checkID = catchAsyncParam(async (req, res, next, val) => {
    const id = val * 1; //trick: convert string to number by * with 1

    console.log(`Tour id is: ${val}`);

    const tour = await TourDAO.getTour(id);

    if (!tour) {
        throw new AppError(`not found item with id ${id}`, 404)
    }

    req.tour = tour;

    next();
});

//top 5 alias - middleware
exports.aliasTopTour = (req, res, next) => {
    req.query.pageSize = '5';
    req.query.sort = 'price,-ratingsAverage';
    next();
};



//the new way - create catchAsync to handle error in one place
exports.getAllTours = catchAsync(async (req, res, next) => {
    // console.log(req.query);

    const {page,pageSize,totalPage,totalItem,tours} = await TourDAO.getAllTours(req.query);

    // console.log(tours);
    res.status(200).json({
        //200 - OK
        status: 'success',
        page,
        pageSize,
        totalPage,
        totalItem,
        data: {
            tours
        },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = req.tour;

    // console.log(tour);
    res.status(200).json({
        //200 - OK
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = Object.assign({}, req.body);

    await TourDAO.addTour(newTour);

    const tour = await TourDAO.getTourByName(newTour.name);

    res.status(201).json({
        //201 - Created
        status: 'success',
        data: {
            tour,
        },
    });
});


exports.updateTour = catchAsync(async (req, res, next) => {
    const id = req.params.id * 1; //trick: convert string to number by * with 1

    const updateTour = Object.assign({}, req.body);
    await TourDAO.updateTour(
        id,
        updateTour
    );

    const tour = await TourDAO.getTour(id);

    res.status(200).json({
        //200 - OK
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const id = req.params.id * 1; //trick: convert string to number by * with 1

    await TourDAO.deleteTour(id);

    res.status(204).json({
        //204 - NO CONTENT
        status: 'success',
        data: null,
    });
});
