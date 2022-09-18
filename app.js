const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');

var session = require('express-session');

const indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

const {maxAge} = require("express-session/session/cookie");
const Cookies = require("cookies");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/api', apiRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(session({
  secret:"somesecretkey",
  resave: false, // Force save of session for each request
  saveUninitialized: false, // Save a session that is new, but has not been modified
  cookie: {maxAge: 60*1000}
}));



// Use the session middleware
app.use(session({ secret: 'somesecretkey', cookie: { maxAge: 60*1000 }}))



module.exports = app;
