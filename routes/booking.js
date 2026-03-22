const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");


const { isLoggedIn, isProvider, validateService, validateReview, isOwner, isReviewAuthor } = require("../middleware.js");
const Event = require("../model/events");
const Service = require("../model/services");
const Review = require("../model/review");
const Booking = require("../model/booking");

const bookingController = require("../controllers/bookingController.js");

router.post(
  "/events/:eventName/book",
  isLoggedIn,
  wrapAsync(bookingController.createBooking)
);

router.get("/history", isLoggedIn, wrapAsync(bookingController.getUserHistory));

router.get("/network", wrapAsync(bookingController.getNetwork));

router.get("/aboutus", bookingController.aboutus);


module.exports = router;