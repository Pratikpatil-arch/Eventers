const Service = require("../model/services");
const Booking = require("../model/booking");
const { sendUserEmail, sendOwnerEmails } = require("../middleware");

module.exports.createBooking = async (req, res) => {
    const { eventName } = req.params;
    let { selectedServices } = req.body;

    if (!selectedServices) {
        req.flash("error", "No services selected");
        return res.redirect(`/events/${eventName}/services`);
    }

    //  ensure array
    if (!Array.isArray(selectedServices)) {
        selectedServices = [selectedServices];
    }

    //  fetch services + owners
    const services = await Service.find({
        _id: { $in: selectedServices },
    }).populate("owner");

    const user = req.user;

    //  extract unique owners
    const ownerIds = [
        ...new Set(services.map((s) => s.owner._id.toString())),
    ];

    const totalPrice = services.reduce((sum, service) => {
        return sum + (service.charges || 0);
    }, 0);

    //  save booking
    const newBooking = new Booking({
        client: user._id,
        services: selectedServices,
        serviceOwners: ownerIds,
        totalPrice: totalPrice,
    });

    await newBooking.save();

    // send emails
    await sendUserEmail(user, services, totalPrice);
    await sendOwnerEmails(user, services ,totalPrice);

    req.flash("success", "Booking successful & saved!");
    res.redirect(`/events/${eventName}/services`);
};




module.exports.getUserHistory = async (req, res) => {
  const userId = req.user._id;
  let bookings = [];
  let totalServices = 0;

  // CLIENT VIEW
  if (req.user.role === "client") {
    bookings = await Booking.find({ client: userId })
      .populate({
        path: "services",
        populate: { path: "owner" }
      })
      .sort({ bookingDate: -1 });

    bookings.forEach(b => {
      totalServices += b.services.length;
    });
  }

  // PROVIDER VIEW
  else if (req.user.role === "provider") {
    bookings = await Booking.find({
      serviceOwners: userId   //  THIS IS THE KEY FIX
    })
      .populate("client")
      .populate({
        path: "services",
        populate: { path: "owner" }
      })
      .sort({ bookingDate: -1 });

    //  filter only this provider’s services
    bookings = bookings.map(booking => {
      const filteredServices = booking.services.filter(
        s => s.owner && s.owner._id.equals(userId)
      );

      return {
        ...booking.toObject(),
        services: filteredServices
      };
    });
  }

  res.render("bookings/history.ejs", {
    bookings,
    totalServices,
    currUser: req.user
  });
};

module.exports.getNetwork = async (req, res) => {
  const services = await Service.find({})
    .populate("owner");

  res.render("static/network.ejs", { services });
};

module.exports.aboutus=(req, res) => {
  res.render("static/about.ejs");
};