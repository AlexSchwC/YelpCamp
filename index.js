const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require('method-override');

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
server.use(methodOverride( "_method" ))

server.engine("ejs", ejsMate);

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.get("/", (req, res) => {
    res.render("home");
});

server.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("./campgrounds/campground", { campgrounds })
});

server.get("/campgrounds/new", (req, res) => {
    res.render("./campgrounds/new");
})

server.post("/campgrounds", async (req, res) => {
    const newCampground = new Campground(req.body);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
})

server.get("/campgrounds/:id/edit", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("./campgrounds/edit", { campground });
})

server.put("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/campgrounds/${id}`)
})

server.delete("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id, {new: true});
    res.redirect("/campgrounds")
})

server.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("./campgrounds/show", { campground })
});

server.listen(3000, () => {
    console.log("Hosting on 3000")
});