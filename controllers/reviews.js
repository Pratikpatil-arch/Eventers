const Event = require("../model/events");
const Service = require("../model/services");
const Review = require("../model/review");



module.exports.createReview =async (req, res) => {
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
    };

    module.exports.deleteReview=async (req, res) => {
            const { eventName, service_id, reviewId } = req.params;
            // remove reference from service
            await Service.findByIdAndUpdate(service_id, {
                $pull: { reviews: reviewId }
            });
            // delete review document
            await Review.findByIdAndDelete(reviewId);
              req.flash("success","Review Deleted");
            res.redirect(`/events/${encodeURIComponent(eventName)}/services/${service_id}`);
        };