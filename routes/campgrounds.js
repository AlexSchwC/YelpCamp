const express = require('express')
const router = express.Router()

const asyncHandler = require("../util/asyncHandler")
const ExpressError = require("../util/ExpressError")
const isLoggedIn = require('../util/isLoggedIn')

const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas-joi.js")

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

router.get("/", asyncHandler(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("./campgrounds/campground", { campgrounds })
}))

router.get("/new", isLoggedIn, (req, res) => {
    res.render("./campgrounds/new")
})

router.post("/", validateCampground, asyncHandler(async (req, res) => {
    const newCampground = new Campground(req.body);
    await newCampground.save();
    req.flash('success', 'Succesfully created campground')
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

router.get("/:id/edit", asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("./campgrounds/edit", { campground });
}))

router.put("/:id", validateCampground, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/campgrounds/${id}`)
}))

router.delete("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds")
}))

router.get("/:id", asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    if(!campground) {
        req.flash('error', 'Campground not found!')
        return res.redirect("/campgrounds")
    }
    res.render("./campgrounds/show", { campground })
}))

module.exports = router