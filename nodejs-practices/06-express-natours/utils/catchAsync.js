module.exports = (fn) => {
    return (req, res, next) => {
        //fn is an async function = promise
        fn(req, res, next)
            .catch(err => next(err));
    }
}