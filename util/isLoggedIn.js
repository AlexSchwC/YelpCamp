module.exports = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnUrl = req.originalUrl
        req.flash('error', 'You must be signed in')
        return res.redirect('/login')
    }
    next()
}