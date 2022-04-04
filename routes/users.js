const express = require('express')
const router = express.Router()
const asyncHandler = require('../util/asyncHandler.js')
const passport = require('passport')

const User = require('../models/user.js')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', asyncHandler( async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password)
        req.flash('success', 'Welcome to YelpCamp!')
        res.redirect('/campgrounds')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome back!')
    res.redirect('/campgrounds')
})

module.exports = router