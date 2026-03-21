const passport = require("passport");
const { serviceSchema, reviewSchema } = require("./schema.js");
const User = require("./model/user.js");
const ExpressError = require("./utils/ExpressError.js");
const Service = require("./model/services.js");
const Review = require("./model/review.js");





// middleware.js
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.isProvider = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "provider") {
        req.flash("error", "Only service providers can perform this action!");
        return res.redirect("/events"); // or redirect somewhere safe
    }
    next();
};



module.exports.validateService = (req, res, next) => {
    const { error } = serviceSchema.validate(req.body);
    if (error) {
        return res.send(error.details.map(e => e.message).join(", "));
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
     next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if( req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { eventName, service_id } = req.params;
    const service = await Service.findById(service_id);
    
    if (!service) {
        req.flash("error", "Service not found");
        return res.redirect(`/events/${encodeURIComponent(eventName)}/services`);
    }

    if (!service.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this service");
        return res.redirect(`/events/${encodeURIComponent(eventName)}/services`);
    }

    next();
};


module.exports.isReviewAuthor = async(req,res,next)=>{
     let { service_id,eventName, reviewId } = req.params;
     let review = await Review.findById(reviewId);
     if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/events/${encodeURIComponent(eventName)}/services/${service_id}`);
     }
     next();
}