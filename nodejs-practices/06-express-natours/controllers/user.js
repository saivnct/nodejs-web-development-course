const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/AppError");
const UserDAO = require('../db/UserDAO');

//save file to disk
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-id-timestamp.[file extension]
//     const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

//save file to cache
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // console.log('multerFilter', file);
  if (file.mimetype.startsWith('image')){
    cb(null,true);
  }else{
    cb(new AppError('Not an image! Please upload only image', 400),false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});


exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  //file will be store in buffer because we're using memoryStorage (cache)
  await sharp(req.file.buffer)
      .resize(500,500)
      .toFormat('jpeg')
      .jpeg({
        quality: 90 //compress 90%
      })
      .toFile(`public/img/users/${req.file.filename}`)
  ;

  next();
});


exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);

  let update = {};

  if (req.body.name){
    update.name = req.body.name.trim();
  }

  if (req.file){
    update.photo = req.file.filename;
  }


  let currentUser = req.user;

  await UserDAO.updateUser(currentUser.id, update)

  currentUser = await UserDAO.getUser(currentUser.id);
  delete currentUser.password
  delete currentUser.passwordAt

  res.locals.user = currentUser;  //in the pug templates, there will be a variable named 'user'



  res.status(201).json({
    //201 - Created
    status: 'success',
    data: {
      user: currentUser,
    },
  });


});




//2) ROUTE HANDLERS
exports.getAllUsers = catchAsync(async (req, res, next) => {
  throw new AppError('This route is not yet defined', 500);
});

exports.getUser = catchAsync(async (req, res, next) => {
  throw new AppError('This route is not yet defined', 500);
});

exports.createUser = catchAsync(async (req, res, next) => {
  throw new AppError('This route is not yet defined', 500);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  throw new AppError('This route is not yet defined', 500);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  throw new AppError('This route is not yet defined', 500);
});
