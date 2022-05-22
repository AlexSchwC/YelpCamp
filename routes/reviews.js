const express = require('express')
const router = express.Router({mergeParams: true})

const asyncHandler = require("../util/asyncHandler")
const ExpressError = require("../util/ExpressError")

const Review = require("../models/review")
const Campground = require("../models/campground")
const { reviewSchema } = require("../schemas-joi.js")

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

router.post("/", validateReview, asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Succesfully created review!')
    res.redirect(`/campgrounds/${campground.id}`)
}))

router.delete("/:reviewID", asyncHandler(async (req, res) => {
    const { id, reviewID } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(reviewID)
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router