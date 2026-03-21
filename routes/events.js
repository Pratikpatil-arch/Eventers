const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { serviceSchema ,reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Event = require("../model/events");
const Service = require("../model/services");
const Review = require("../model/review");

const { isLoggedIn, isProvider , validateService , validateReview, isOwner , isReviewAuthor} = require("../middleware.js");






router.get("/", wrapAsync(async (req, res) => {
    let events = await Event.find({});
    res.render("services/events.ejs", { events });
}));


router.get("/:eventName/services", wrapAsync(async (req, res) => {
    const { eventName } = req.params;
    const event = await Event.findOne({ name: eventName });
    const services = await Service.find({ events: event._id }).populate("owner");
    res.render("services/index.ejs", { services: services, eventName: event ,currUser:req.user});
}));

router.get("/:eventName/services/new",isLoggedIn, isProvider, wrapAsync(async (req, res) => {
    const { eventName } = req.params;
    const event = await Event.findOne({ name: eventName });
    const services = await Service.find({ events: event._id });
    res.render("services/new.ejs", { services: services, eventName: event });
}));

router.post("/:eventName/services",isLoggedIn ,isProvider, validateService, wrapAsync(async (req, res) => {
    const { eventName } = req.params;
    const { service } = req.body;
    const event = await Event.findOne({ name: eventName });
    if (!event) {
        return res.status(404).send("Event not found");
    }
    if (service.keyFeatures) {
        service.keyFeatures = service.keyFeatures
            .split(",")
            .map(f => f.trim())
            .filter(f => f.length > 0);
    }

    // 3. Link service to event
    service.events = [event._id];
    const newService = new Service(service);
    newService.owner = req.user._id;
    await newService.save();
    req.flash("success","New Service Created")
    res.redirect(`/events/${encodeURIComponent(eventName)}/services`);
}));


router.get("/:eventName/services/:service_id", wrapAsync(async (req, res) => {
    let { service_id, eventName } = req.params;
    const service = await Service.findById(service_id)
        .populate({path:"reviews",populate:{
            path:"author",
        },
    })
        .populate("owner");
    if(!service){
      req.flash("error","Service you requested for does not exist!");
          return res.redirect(`/events/${encodeURIComponent(eventName)}/services`);
    }
    console.log(service);
    res.render("services/show.ejs", { service, eventName });
}));

router.get("/:eventName/services/:service_id/edit",isLoggedIn,isProvider,isOwner, wrapAsync(async (req, res) => {
    const { eventName, service_id } = req.params;

    const service = await Service.findById(service_id);

    if (!service) {
        req.flash("error","Service you requested for does not exist!");
        return res.redirect(`/events/${encodeURIComponent(eventName)}/services`);
    }

    res.render("services/edit.ejs", { service, eventName });
}));


//Update Route
router.put("/:eventName/services/:service_id", isLoggedIn ,isProvider,isOwner, validateService, wrapAsync(async (req, res) => {
    const { eventName, service_id } = req.params;
    const { service } = req.body;

    // Convert keyFeatures (same as POST)
    if (service.keyFeatures) {
        service.keyFeatures = service.keyFeatures
            .split(",")
            .map(f => f.trim())
            .filter(f => f.length > 0);
    }

    const updatedService = await Service.findByIdAndUpdate(
        service_id,
        service,
        { returnDocument: "after", runValidators: true }
    );
     req.flash("success","Service Updated");
    res.redirect(`/events/${encodeURIComponent(eventName)}/services`);
}));


router.delete("/:eventName/services/:service_id",isLoggedIn,isProvider,isOwner, wrapAsync(async (req, res) => {
    const { eventName, service_id } = req.params;

    await Service.findByIdAndDelete(service_id);
     req.flash("success","Service Deleted");
    res.redirect(`/events/${encodeURIComponent(eventName)}/services`)
}));










router.post("/:eventName/services/:service_id/reviews",
    isLoggedIn,
    validateReview,
    wrapAsync(async (req, res) => {
        const { eventName, service_id } = req.params;

        const service = await Service.findById(service_id);
        if (!service) {
            return res.status(404).send("Service not found");
        }

        const newReview = new Review(req.body.review);
         newReview.author = req.user._id;
        // link review → service
        service.reviews.push(newReview._id);
        await newReview.save();
        await service.save();
         req.flash("success","New review Created");
        res.redirect(`/events/${encodeURIComponent(eventName)}/services/${service_id}`);
    })
);


router.delete("/:eventName/services/:service_id/reviews/:reviewId",isLoggedIn,isReviewAuthor,
    wrapAsync(async (req, res) => {
        const { eventName, service_id, reviewId } = req.params;
        // remove reference from service
        await Service.findByIdAndUpdate(service_id, {
            $pull: { reviews: reviewId }
        });
        // delete review document
        await Review.findByIdAndDelete(reviewId);
          req.flash("success","Review Deleted");
        res.redirect(`/events/${encodeURIComponent(eventName)}/services/${service_id}`);
    })
);

module.exports = router;