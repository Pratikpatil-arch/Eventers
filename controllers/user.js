const Event = require("../model/events");
const Service = require("../model/services");
const Review = require("../model/review");
const User = require("../model/user");



module.exports.renderSignupForm= (req, res) => {
    res.render("users/signup.ejs");
}



module.exports.signup=async (req, res,next) => {
    try {
        const { username, email, password, role ,phoneNumber} = req.body; // include role
        const newUser = new User({ username, email, role ,phoneNumber }); // save role in DB
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Eventers!");
            res.redirect("/events");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}


module.exports.renderLoginform= (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login =async (req, res) => {
    req.flash("success", "Welcome to Eventers!");
    let redirectUrl = res.locals.redirectUrl || "/events";
    res.redirect(redirectUrl);
};

module.exports.logout=(req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/events");
    })
}
