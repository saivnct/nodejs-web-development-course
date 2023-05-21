const catchAsync = require('../utils/catchAsync');
const TourDAO = require('../db/TourDAO');
const ReviewDAO = require('../db/ReviewDAO');
const UserDAO = require('../db/UserDAO');
const AppError = require('../utils/AppError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tours from db
  //assuming that we will implement pagination later
  const {tours} = await TourDAO.getAllTours({ });

  // 2) Render template with data from 1)
  res.status(200)
    .render('overview', {
      title: 'All tours',
      tours
    });
});


exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get tour from db
  // 1) Get tour's reviews from db
  const tour = await TourDAO.getTour(req.params.id);

  if (!tour) {
    throw new AppError(`There is no tour with that id`, 404);
  }

  let {reviews} = await ReviewDAO.getAllReviews({
    tourId: req.params.id
  });

  const reviewsPromises = reviews.map(async review => {
    const user = await UserDAO.getUser(review.userId);
    return {
      ...review,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        name: user.name,
        photo: user.photo,
        role: user.role,
      }
    }
  });
  reviews = await Promise.all(reviewsPromises);

  // console.log(reviews);


  // 2) Render template with data from 1)
  res.status(200)
      .render('tour', {
          title: `${tour.name} Tour`,
          tour,
          reviews
      });
})

exports.getLogin = (req, res) => {
  res.status(200)
    .render('login', {
      title: 'Login Into Your Account',
    });
}

exports.getAccount = (req, res) => {
  res.status(200)
    .render('account', {
      title: 'Your Account',
    });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log('body',req.body);
  const name = req.body.name.trim();
  if (name){
    await UserDAO.updateUser(req.user.id, {
      name: name
    })

    const currentUser = await UserDAO.getUser(req.user.id);
    res.locals.user = currentUser;  //in the pug templates, there will be a variable named 'user'
  }


  res.status(200)
    .render('account', {
      title: 'Your Account',
    });
})