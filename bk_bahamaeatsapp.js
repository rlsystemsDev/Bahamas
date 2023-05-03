var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
var logger = require('morgan');
const passport = require('passport');
const fs = require('fs');
var PORT = 8008;

global.appRoot = path.resolve(__dirname);

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();
var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS
 
// Don't redirect if the hostname is `localhost:port` or the route is `/insecure`
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));

// const server = require('http').createServer(app);  
const server = require('https').createServer({  
  key: fs.readFileSync("/etc/pki/tls/private/server.key", 'utf8'),
  ca: fs.readFileSync("/etc/pki/tls/certs/bahamaeats_ca-bundle.pem", 'utf8'),
  cert: fs.readFileSync("/etc/pki/tls/certs/bahamaeats.pem", 'utf8'),
}, app);  

const io = require('socket.io')(server);
const socket = require('./socket')(io);
//var server = require('http').createServer(app);
// var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileupload());
app.use(fileupload({
useTempFiles : true,
tempFileDir : '/tmp/'
}));
app.use(passport.initialize());

require('./passport')(passport);
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
require('./config/routes')(app);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
});
server.listen(PORT, function () {
  console.log('Bahmaeats App listening on port:' + PORT);
});
module.exports = app;
