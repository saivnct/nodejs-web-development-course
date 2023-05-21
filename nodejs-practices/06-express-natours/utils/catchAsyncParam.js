module.exports = (fn) => {
    return (req, res, next, val) => {
        //fn is an async function = promise
        fn(req, res, next, val)
            .catch(err => next(err));
    }
}