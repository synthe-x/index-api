var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const {connect} = require('./src/db');
const cors = require('cors');
const { syncAndListen, _syncAndListen } = require('./src/sync/sync');
const { SystemConfig } = require('./src/sync/configs/system');

var app = express();


app.use(cors(
  {
    origin: ['https://316.synthex.finance']
}
));
app.use(logger('dev')); 
app.use(express.json());
app.use(helmet())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
connect();
app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/', usersRouter);
_syncAndListen(SystemConfig);
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

module.exports = app;
