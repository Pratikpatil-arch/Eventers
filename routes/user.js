const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../model/user");


router.get("/signup",(req,res)=>{
      res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, role } = req.body; // include role
        const newUser = new User({ username, email, role }); // save role in DB
        const registeredUser = await User.register(newUser, password);
         console.log(registeredUser);
        req.flash("success", "Welcome to Eventers!");
        res.redirect("/events");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});


router.get("/login",(req,res)=>{
      res.render("users/login.ejs");
});


router.post("/login", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), async (req, res) => {
  req.flash("success","Welcome to Eventers!");
  res.redirect("/events");
});

module.exports=router;