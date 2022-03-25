const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Joi = require("joi");

const asyncHandler = require("./public/../utillity/asyncHandler");
const ExpressError = require("./public/../utillity/ExpressError")

const mongoose = require("mongoose");

const Campground = require("./models/campground");
const Review = require("./models/review");
const { campgroundSchema, reviewSchema } = require("./schemas-joi.js")

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
server.use('/public', express.static(__dirname + '/views'));
server.engine("ejs", ejsMate);

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

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