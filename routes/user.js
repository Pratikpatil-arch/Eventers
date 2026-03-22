const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../model/user");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/user");


router.get("/signup",userController.renderSignupForm);

router.post("/signup", userController.signup);


router.get("/login",userController.renderLoginform);


router.post("/login",saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), 
            userController.login);


router.get("/logout",userController.logout )


module.exports = router;