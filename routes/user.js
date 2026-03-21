const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../model/user");
const { saveRedirectUrl } = require("../middleware");


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", async (req, res,next) => {
    try {
        const { username, email, password, role } = req.body; // include role
        const newUser = new User({ username, email, role }); // save role in DB
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
});


router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});


router.post("/login",saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), async (req, res) => {
    req.flash("success", "Welcome to Eventers!");
    let redirectUrl = res.locals.redirectUrl || "/events";
    res.redirect(redirectUrl);
});



router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/events");
    })
})


module.exports = router;