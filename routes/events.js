const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { serviceSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Event = require("../model/events");
const Service = require("../model/services");
const Review = require("../model/review");

const { isLoggedIn, isProvider, validateService, validateReview, isOwner, isReviewAuthor } = require("../middleware.js");


const eventController = require("../controllers/events.js");
const reviewController = require("../controllers/reviews.js");





router.get("/", wrapAsync(eventController.eventsIndex));


router.get("/:eventName/services", wrapAsync(eventController.serviceslisting));

router.get("/:eventName/services/new", isLoggedIn, isProvider, wrapAsync(eventController.renderNewService));

router.post("/:eventName/services", isLoggedIn, isProvider, validateService, wrapAsync(eventController.addNewService));


router.get("/:eventName/services/:service_id", wrapAsync(eventController.showServices));

router.get("/:eventName/services/:service_id/edit", isLoggedIn, isProvider, isOwner, wrapAsync(eventController.renderEditServices));


//Update Route
router.put("/:eventName/services/:service_id", isLoggedIn, isProvider, isOwner, validateService, wrapAsync(eventController.showUpdatedservices));


router.delete("/:eventName/services/:service_id", isLoggedIn, isProvider, isOwner, wrapAsync(eventController.deleteService));










router.post("/:eventName/services/:service_id/reviews",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);


router.delete("/:eventName/services/:service_id/reviews/:reviewId", isLoggedIn, isReviewAuthor,
    wrapAsync(reviewController.deleteReview)
);

module.exports = router;