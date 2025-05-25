module.exports = (err, req, res, next) => {
    let status = err.statusCode || 500;
    console.log(err.message);
    if (err.name == "JsonWebTokenError") {
        err.message = "Please login agian.";
        status = 401;
    } else if (err.name == "ValidationError") {
        status = 400;
        if (!err.message) err.message = "invalid data inserted!!!";
    } else if (err.code == 11000) {
        status = 400;
        err.message = "this email address already exist";
    } else if (err.name == "JsonWebTokenError") {
        status = 401;
    } else if (err.code == "LIMIT_FILE_SIZE") {
        status = 400;
    } else if (err.name == "TokenExpiredError") {
        status = 401;
    }
    res.status(status).json({ success: false, msg: err.message });
};
