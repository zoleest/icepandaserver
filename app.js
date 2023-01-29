const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const CronJob = require('cron').CronJob;
const cors = require('cors')

//require configuration
const config = require('./config');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
//Registration
const registrationRouter = require('./routes/registration/registration');
//Login
const loginRouter = require('./routes/login/login');
const lostPasswordRouter = require('./routes/login/lost_password');
const logoutRouter = require('./routes/login/logout');
//My characters controls
const deactivateCharacterRouter = require('./routes/my_characters/deactivate_characters');
const imageProcessorRouter = require('./routes/image_processor/image_processor');
const editCharacterRouter = require('./routes/my_characters/edit_character');
//Characters
const charactersRouter = require('./routes/characters/characters');
//Locations
const gameRouter = require('./routes/game/game');
//Comments
const commentsRouter = require('./routes/comments/comments');
//Coupons
const couponsRouter = require('./routes/coupons/coupons');
//Recent comments
const recentLocationCommentsRouter = require('./routes/recent_comments/recent_location_comments');

const notificationsRouter = require('./routes/admin/notifications');


const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Session building

let store = new MongoStore({
    mongoUrl: config.mongoUrl,
    dbName: "IcePanda",
    collection: "sessions"
});

app.use(requestSession = session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false,
    store: store,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * config.maxSessionDays}
}));


app.use(cors({
    credentials: true,
    origin: ['http://localhost:3001']
}))

app.use(logger('dev'));
app.use(express.json({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(cookieParser());

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

const assetsPath = path.join(__dirname, '/public');
app.use(express.static(assetsPath));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//Registration
app.use('/registration', registrationRouter);
//Login
app.use('/login', loginRouter);
app.use('/lost-password', lostPasswordRouter);
app.use('/logout', logoutRouter);
//My characters controls
app.use('/my-characters/deactivate', deactivateCharacterRouter);
app.use('/my-characters/edit', editCharacterRouter);
//CKE image processor
app.use('/image_processor', imageProcessorRouter);
//Characters
app.use('/characters', charactersRouter);
//Locations
app.use('/game', gameRouter);
//Comments
app.use('/comments', commentsRouter);
//Coupons
app.use('/coupons', couponsRouter);
//Recent comments
app.use('/recent', recentLocationCommentsRouter);

//admin
//Notifications
app.use('/admin-notifications', notificationsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


const Mongo = require("mongodb");

const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = MongoClient.db("IcePanda").collection("IcePandaUsers");


//Cron to upgrade levels
const job = new CronJob(
    '0 0 0 * * *',
    function () {
        let today = new Date();

        //last month's date and today's date
        let dateString = today.toLocaleString();


        today.setMonth(today.getMonth() - 1);
        let previousDateString = today.toLocaleString();


        MongoDBCollection.updateMany({"lastUpdate": {$lte: previousDateString}}, {
            $inc: {"level": 1},
            $set: {"lastUpdate": dateString}
        });
    },
    null,
    true,
    'Europe/Budapest'
);


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
