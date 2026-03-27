const Event = require("../model/events");
const Service = require("../model/services");




module.exports.eventsIndex =async (req, res) => {
    let events = await Event.find({});
    res.render("services/events.ejs", { events });
}

module.exports.serviceslisting=async (req, res) => {
    const { eventName } = req.params;
    const event = await Event.findOne({ name: eventName });
    const services = await Service.find({ events: event._id }).populate("owner");
    res.render("services/index.ejs", { services: services, eventName: event ,currUser:req.user});
};

module.exports.renderNewService=async (req, res) => {
    const { eventName } = req.params;
    const event = await Event.findOne({ name: eventName });
    const services = await Service.find({ events: event._id });
    res.render("services/new.ejs", { services: services, eventName: event });
}

module.exports.addNewService =async (req, res) => {
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
}

module.exports.showServices =async (req, res) => {
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
    res.render("services/show.ejs", { service, eventName , currUser : req.user});
}

module.exports.renderEditServices=async (req, res) => {
    const { eventName, service_id } = req.params;

    const service = await Service.findById(service_id);

    if (!service) {
        req.flash("error","Service you requested for does not exist!");
        return res.redirect(`/events/${encodeURIComponent(eventName)}/services`);
    }

    res.render("services/edit.ejs", { service, eventName });
}


module.exports.showUpdatedservices =async (req, res) => {
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
}

module.exports.deleteService=async (req, res) => {
    const { eventName, service_id } = req.params;

    await Service.findByIdAndDelete(service_id);
     req.flash("success","Service Deleted");
    res.redirect(`/events/${encodeURIComponent(eventName)}/services`)
};