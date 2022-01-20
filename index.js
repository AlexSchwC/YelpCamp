const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const axios = require("axios");

const asyncHandler = require("./public/../utillity/asyncHandler");
const ExpressError = require("./public/../utillity/ExpressError")

const mongoose = require("mongoose");

const Campground = require("./models/campground");

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

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride( "_method" ));
server.use('/public', express.static(__dirname + '/views'));
server.engine("ejs", ejsMate);

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.get("/unsplashreq", async (req, res) => {
    try {
        const data = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
            client_id: '60NX7SpibLK4QEU7wAxv19GMm2PJ86hFX5JJBf_05VU',
            collections: 483251,
        },   
    })
    console.log(data.data.urls.regular)

    } catch (err) {
        console.log(err)
    }
})

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

server.post("/campgrounds", asyncHandler(async (req, res) => {
    const newCampground = new Campground(req.body);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

server.get("/campgrounds/:id/edit", asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("./campgrounds/edit", { campground });
}))

server.put("/campgrounds/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/campgrounds/${id}`)
}))

server.delete("/campgrounds/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id, {new: true});
    res.redirect("/campgrounds")
}))

server.get("/campgrounds/:id", asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("./campgrounds/show", { campground })
}))

server.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
})

server.use((err, req, res, next) => {
    const {status = 500, message = "Something went wrong!"} = err;
    res.status(status).send(message);
})

server.listen(3000, () => {
    console.log("Hosting on 3000")
})