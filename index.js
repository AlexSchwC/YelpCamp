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

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
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

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride( "_method" ));
server.use('/public', express.static(__dirname + '/views'));
server.engine("ejs", ejsMate);

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.get("/", (req, res) => {
    res.render("home");
});

server.get("/campgrounds", asyncHandler(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("./campgrounds/campground", { campgrounds })
}))

server.get("/campgrounds/new", (req, res) => {
    res.render("./campgrounds/new");
})

server.post("/campgrounds", validateCampground, asyncHandler(async (req, res) => {
    const newCampground = new Campground(req.body);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

server.post("/campgrounds/:id/reviews", validateReview, asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground.id}`)
}))

server.delete("/campgrounds/:id/reviews/:reviewID", asyncHandler(async (req, res) => {
    const { id, reviewID } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(reviewID)
    res.redirect(`/campgrounds/${id}`)
}))

server.get("/campgrounds/:id/edit", asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("./campgrounds/edit", { campground });
}))

server.put("/campgrounds/:id", validateCampground, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/campgrounds/${id}`)
}))

server.delete("/campgrounds/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds")
}))

server.get("/campgrounds/:id", asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    res.render("./campgrounds/show", { campground })
}))

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