// const errorMiddleware = (err, req, res, next) =>{
//     error.statusCode = error.statusCode || 500;
//     error.message = error.message || "Something went wrong!!";

//     return res.status(err.statusCode).json({
//         success: false,
//         message: err.message,
//         stack: err.stack
//     })
// }


// export default errorMiddleware;
function errorMiddleware(err, req, res, next) {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: err.stack
    });
}

export default errorMiddleware;