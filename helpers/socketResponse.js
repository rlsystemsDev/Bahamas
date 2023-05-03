/*
|----------------------------------------------------------------------------------------------------------------------------
|   Socket Response Helpers File
|----------------------------------------------------------------------------------------------------------------------------
|
|   All socket response helper methods in this file.
|
*/

/*
|----------------------------------------------------------------------------------------------------------------------------
|   Exporting all methods
|----------------------------------------------------------------------------------------------------------------------------
*/
module.exports = {
    successTo: function (socket, socketId, listener, message = '', body = {}) {
        return socket.to(socketId).emit(listener, {
            'success': true,
            'code': 200,
            'message': message,
            'body': body
        });
    },
    success: function (socket, listener, message = '', body = {}) {
        return socket.emit(listener, {
            'success': true,
            'code': 200,
            'message': message,
            'body': body
        });
    },
    error: function (err, socket, listener) {
        console.log(err, '===========================>error');
        // return false;
        // let code=(typeof err==='object') ? ((err.statusCode) ? err.statusCode : ((err.code) ? err.code : 403)) : 403;
        let code = (typeof err === 'object') ? (err.code) ? err.code : 403 : 403;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        if (!Number(code)) code = 403;

        console.log(code, '===================>code');
        console.log(message, '===================>message');

        return socket.emit(listener, {
            'success': false,
            'code': code,
            'message': message,
            'body': {}
        });
    },
}