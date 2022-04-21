const express = require('express')
const router = express.Router()
const asyncHandler = require('../util/asyncHandler.js')
const passport = require('passport')

const User = require('../models/user.js')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', asyncHandler( async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to YelpCamp!')
            res.redirect('/campgrounds')
        })
    } catch (err) {
        req.flash('error', err.message)
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
    const returnUrl = req.session.returnUrl || '/campgrounds'
    delete req.session.returnUrl
    res.redirect(returnUrl)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'Goodbye')
    res.redirect('/campgrounds')
})

module.exports = router