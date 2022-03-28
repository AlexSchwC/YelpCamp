const express = require("express");
const session = require("express-session")
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const ExpressError = require("./util/ExpressError")

const mongoose = require("mongoose");

const campgroundRoutes = require('./routes/campgrounds.js')
const reviewsRoutes = require('./routes/reviews.js')

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

const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride( "_method" ));
server.use(express.static(__dirname + '/public'));
server.engine("ejs", ejsMate);

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

server.get("/", (req, res) => {
    res.render("home");
});

server.use('/campgrounds', campgroundRoutes)
server.use('/campgrounds/:id/reviews', reviewsRoutes)

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