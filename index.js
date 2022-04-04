const express = require("express");
const session = require("express-session")
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const flash = require("connect-flash")

const passport = require('passport')
const LocalStrategy = require('passport-local')

const ExpressError = require("./util/ExpressError")

const mongoose = require("mongoose");
const User = require('./models/user.js')

const campgroundRoutes = require('./routes/campgrounds.js')
const reviewRoutes = require('./routes/reviews.js')
const userRoutes = require('./routes/users.js')


mongoose.connect("mongodb://0.0.0.0:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}) 
.then(() => {
    console.log("Mongo OPEN");
})
.catch((err) => {
    console.log("Mongo ERROR");
    console.log(err);
})

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride( "_method" ));
server.use(express.static(__dirname + '/public'));
server.engine("ejs", ejsMate);
server.use(flash());

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.use(session({
    secret: 'hellothere',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

server.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})

server.get("/", (req, res) => {
    res.render("home");
});

server.use('/campgrounds', campgroundRoutes)
server.use('/campgrounds/:id/reviews', reviewRoutes)
server.use('/', userRoutes)

server.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
})

server.use((err, req, res, next) => {
    const {status = 500} = err;
    if (!err.message) {err.message = "Something went wrong! :("}
    res.status(status).render("error", { err })
})

server.listen(3000, () => {
    console.log("Hosting on 3000")
})