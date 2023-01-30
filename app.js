const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
      extended: true
    })
)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.cookie('myCookie', 'myValue', {
        sameSite: 'lax',
        secure: true
    });
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (err.status === 404) {
        res.status(404);
        res.render('errorPage',{ Title: 'Error'});
    } else {
        next(err);
    }
});

// to make sure that we listen on an available port
const port = process.env.PORT || 3000;
app.listen(port, 'localhost', () => {
  console.log(`Ready to receive requests to port ${port}.`);
});

module.exports = app;
