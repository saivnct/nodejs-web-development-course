const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const AppError = require("../utils/AppError");
const UserDAO = require('../db/UserDAO');

const FormValidation = require('../utils/FormValidation');
const signupForm = require('../form/signup');
const loginForm = require('../form/login');
const changepassForm = require('../form/changepass');

const signToken = (id) => {
    return jwt.sign(
        {
            id: id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRED_IN,
        }
    );
}

const setJWTCookies = (jwt, expires, res) => {
    if (!expires){
        expires = new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        )
    }

    const cookieOptions = {
        //expires after 90days
        expires: expires,
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('jwt', jwt, cookieOptions);
}

const isUserPasswordAfterDate = (user, date) => {
    // console.log('isUserChangedPasswordAfterDate',user.passwordAt, date);
    const passwordAt = new Date(user.passwordAt);
    const passwordAtTimeStamp = parseInt(passwordAt.getTime() / 1000)

    return date < passwordAtTimeStamp;
}


//2) ROUTE HANDLERS
exports.signup = catchAsync(async (req, res, next) => {
    const form = FormValidation.validateForm(signupForm, req.body);

    await UserDAO.addUser({
        userName: form.userName,
        name: form.name,
        email: form.email,
        password: form.password,
    });

    const user = await UserDAO.getUserByUserName(form.userName);

    const token = signToken(user.id);

    setJWTCookies(token, null, res);

    delete user.password;
    delete user.passwordAt
    res.status(201).json({
        //201 - Created
        status: 'success',
        data: {
            token,
            user,
        },
    });
});


exports.login = catchAsync(async (req, res, next) => {
    const form = FormValidation.validateForm(loginForm, req.body);

    const user = await UserDAO.getUserByUserName(form.userName);
    if (!user){
        //401 - Unauthorized
        throw new AppError(`Invalid user - ${form.userName}`, 401);
    }

    const isValidPassword = await bcrypt.compare(form.password, user.password);
    if (!isValidPassword){
        throw new AppError(`Invalid authentication`, 401);
    }

    const token = signToken(user.id, res);

    setJWTCookies(token, null, res);

    res.status(200).json({
        //200 - success
        status: 'success',
        data: {
            token,
        },
    });
});


exports.updatePassword = catchAsync(async (req, res, next) => {
    const form = FormValidation.validateForm(changepassForm, req.body);

    let currentUser = req.user;

    const isValidPassword = await bcrypt.compare(form.currentPassword, currentUser.password);
    if (!isValidPassword){
        throw new AppError(`Invalid Current Password`, 401);
    }

    await UserDAO.updateUser(currentUser.id, {
        password: form.password
    })

    currentUser = await UserDAO.getUser(currentUser.id);

    const token = signToken(currentUser.id, res);
    setJWTCookies(token, null, res);


    res.locals.user = currentUser;  //in the pug templates, there will be a variable named 'user'

    delete currentUser.password;
    delete currentUser.passwordAt;
    res.status(201).json({
        //201 - Created
        status: 'success',
        data: {
            token,
            user: currentUser,
        },
    });

});



exports.logout = (req, res) => {
    //10s
    const expires = new Date(
      Date.now() + 10 * 1000
    )
    setJWTCookies('',  expires, res);

    res.status(200).json({
        //200 - success
        status: 'success',
    });

}

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      //authentication user base on jwt that sent with http request header
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }else if (req.cookies.jwt){
        //authentication user base on jwt that sent by cookie
        token = req.cookies.jwt;
    }

    if (!token) {
        throw new AppError('You are not logged in! Please log in to get access.', 401)
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log("jwt:",decoded);

    // 3) Check if user still exists
    const currentUser = await UserDAO.getUser(decoded.id);
    if (!currentUser) {
        throw new AppError(`Invalid authentication`, 401);
    }

    // 4) Check if user changed password after the token was issued
    if (isUserPasswordAfterDate(currentUser, decoded.iat)) {
        throw new AppError(`'User recently changed password! Please log in again.`, 401);
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;  //in the pug templates, there will be a variable named 'user'
    next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if (!req.cookies.jwt){
        return  next();
    }

    // 1) Verification token from cookies
    let decoded;
    try{
        decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    }catch (e) {
        console.log(e);
    }

    if (!decoded){
        const expires = new Date(
            Date.now() + 10 * 1000
        )
        setJWTCookies('',  expires, res);
        return next();
    }

    console.log("jwt:",decoded);


    // 2) Check if user still exists
    const currentUser = await UserDAO.getUser(decoded.id);
    if (!currentUser) {
       return next();
    }

    // 3) Check if user changed password after the token was issued
    if (isUserPasswordAfterDate(currentUser, decoded.iat)) {
        return next();
    }

    // THERE IS A LOGGED IN USER
    res.locals.user = currentUser;  //in the pug templates, there will be a variable named 'user'
    next();
});


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles [StaticData.AUTH.Role.admin, StaticData.AUTH.Role.leadGuide]
        if (!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perforn this action', 403));
        }
        next();
    }

}