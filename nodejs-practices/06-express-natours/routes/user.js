const express = require('express');

const userController = require('./../controllers/user');
const authController = require('./../controllers/auth');



const router = express.Router(); //router is a middleware

//region AUTHENTICATION
//signup is special endpoint, it does not fit REST architecture
//in some special case we can create endpoints that do not 100% fit REST philosophy
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/logout',authController.logout)
//endregion

router.use(authController.protect);
//upload.single because we want to upload only 1 image
//'photo' is the name of the field in submitted form. multer will copy the file from 'photo' field to  'public/img/users' folder
//and then it call userController.updateMe with information of the file to the req
router.patch('/updateMe',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe);

router.patch('/updateMyPassword', authController.updatePassword);

//For administrator
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
