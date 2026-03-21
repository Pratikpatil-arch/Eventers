require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");
const methodOverride = require("method-override");
const Event = require("./model/events");
const Service = require("./model/services");
dns.setServers([
    '1.1.1.1',
    '8.8.8.8',
]);
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");





const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 9000;

const connectDb = async () => {
    await mongoose.connect(MONGO_URL);
}
connectDb()
    .then(() => {
        console.log("database Connected Successfully");
    })
    .catch((err) => {
        console.log(err);
    })



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



// Add your Event model at the top if you haven't already
// const { Event } = require('./models/models.js'); // Adjust path as needed

// app.get("/seed-events", async (req, res) => {
//     const dummyEvents = [
//         { 
//             name: "Marriage", 
//             description: "A beautiful wedding ceremony and celebration.", 
//             image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=60" 
//         },
//         { 
//             name: "Corporate Meeting", 
//             description: "Professional business gatherings, seminars, and conferences.", 
//             image: "https://images.unsplash.com/photo-1515169065240-5205d5e75467?auto=format&fit=crop&w=800&q=60" 
//         },
//         { 
//             name: "Funeral", 
//             description: "Respectful and dignified funeral and memorial services.", 
//             image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=800&q=60" 
//         },
//         { 
//             name: "Birth Anniversary", 
//             description: "Joyful birthday celebrations for all ages.", 
//             image: "https://images.unsplash.com/photo-1530103862676-de8892795e27?auto=format&fit=crop&w=800&q=60" 
//         },
//         { 
//             name: "Death Anniversary", 
//             description: "Memorial gatherings to honor and remember loved ones.", 
//             image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=800&q=60" 
//         },
//         { 
//             name: "Baby Shower", 
//             description: "Welcoming a new life with friends and family.", 
//             image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=60" 
//         },
//         { 
//             name: "Bachelor Party", 
//             description: "Fun and energetic pre-wedding celebrations.", 
//             image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=60" 
//         },
//         { 
//             name: "Engagement", 
//             description: "Romantic engagement parties to celebrate your commitment.", 
//             image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=60" 
//         },
//         { 
//             name: "Holi Party", 
//             description: "Vibrant and colorful festival of colors celebration.", 
//             image: "https://images.unsplash.com/photo-1553698091-039cff2e0618?auto=format&fit=crop&w=800&q=60" 
//         }
//     ];

//     try {
//         // 1. Delete existing events so we don't get duplicates if you refresh the page
//         await Event.deleteMany({});

//         // 2. Insert the dummy data
//         await Event.insertMany(dummyEvents);

//         res.send("Dummy events inserted successfully! You can now check your database.");
//     } catch (err) {
//         console.error("Error seeding data:", err);
//         res.status(500).send("There was an error seeding the database.");
//     }
// }); //events dummy

// app.get("/seed-services", async (req, res) => {
//     try {
//         const events = await Event.find({});
//         await Service.deleteMany({});

//         const serviceTypes = [
//             "Catering",
//             "Decoration",
//             "Photography",
//             "Music/DJ",
//             "Venue",
//             "Makeup Artist",
//             "Lighting",
//             "Security",
//             "Event Planner"
//         ];

//         let allServices = [];

//         for (let event of events) {
//             for (let i = 0; i < 5; i++) {
//                 allServices.push({
//                     type: serviceTypes[i],
//                     charges: Math.floor(Math.random() * 50000) + 5000,
//                     address: "Nagpur, Maharashtra",
//                     phoneNumber: "9876543210",
//                     keyFeatures: ["Professional", "Experienced", "Affordable"],
//                     events: [event._id]   // 🔗 link to event
//                 });
//             }
//         }

//         await Service.insertMany(allServices);

//         res.send("Dummy services inserted successfully!");
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("Error seeding services");
//     }
// }); //service dummy






app.get("/events", wrapAsync(async (req, res) => {
    let events = await Event.find({});
    res.render("services/events.ejs", { events });
}));


app.get("/events/:eventName/services", wrapAsync(async (req, res) => {
    const { eventName } = req.params;
    const event = await Event.findOne({ name: eventName });
    const services = await Service.find({ events: event._id });

    res.render("services/index.ejs", { services: services, eventName: event });
}));

app.get("/events/:eventName/services/new",wrapAsync( async (req, res) => {
    const { eventName } = req.params;
    const event = await Event.findOne({ name: eventName });
    const services = await Service.find({ events: event._id });
    res.render("services/new.ejs", { services: services, eventName: event });
}));

app.post("/events/:eventName/services",wrapAsync( async (req, res) => {
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
    await newService.save();
    res.redirect(`/events/${encodeURIComponent(eventName)}/services`);
}));


app.get("/events/:eventName/services/:service_id",wrapAsync( async (req, res) => {
    let { service_id, eventName } = req.params;
    const service = await Service.findById(service_id);
    res.render("services/show.ejs", { service });
}));

app.get("/events/:eventName/services/:service_id/edit",wrapAsync(async(req, res) => {
    const { eventName, service_id } = req.params;

    const service = await Service.findById(service_id);

    if (!service) {
        return res.status(404).send("Service not found");
    }

    res.render("services/edit.ejs", { service, eventName });
}));


app.put("/events/:eventName/services/:service_id",wrapAsync(async(req, res) => {
     const { eventName, service_id } = req.params;  
     const { service } = req.body;

     await Service.findByIdAndUpdate(service_id, service);
     res.redirect(`/events/${encodeURIComponent(eventName)}/services`)
}));

app.delete("/events/:eventName/services/:service_id",wrapAsync(async(req, res) => {
     const { eventName, service_id } = req.params;

    await Service.findByIdAndDelete(service_id);

    res.redirect(`/events/${encodeURIComponent(eventName)}/services`)
}));




app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});



app.use((err, req, res, next) => {
    if (err.name === "CastError") {
        err.statusCode = 400;
        err.message = "Invalid ID format";
    }

    let { statusCode = 500, message = "Something went wrong!" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { statusCode, message });
});






app.listen(PORT, (req, res) => {
    console.log(`Server is running on port ${PORT}`);
});
