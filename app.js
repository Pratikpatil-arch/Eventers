require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");
const { serviceSchema, reviewSchema } = require("./schema.js");
const methodOverride = require("method-override");
const Event = require("./model/events");
const Service = require("./model/services");
const Review = require("./model/review");
dns.setServers([
    '1.1.1.1',
    '8.8.8.8',
]);
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const eventsRouter = require("./routes/events.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

const sessionOptions = {
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie:
        {
            expires:new Date(Date.now()+7*24*60*60*60),
            maxAge:7*24*60*60*100,
           httpOnly:true,
        },
  }



const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 9000;
const AWS_KEY= process.env.ALS_KEY;
const AWS_REGION= process.env.AWS_REGION;

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
app.use( session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})



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


const validateService = (req, res, next) => {
    const { error } = serviceSchema.validate(req.body);
    if (error) {
        return res.send(error.details.map(e => e.message).join(", "));
    }
    next();
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    next();
};

app.use("/events", eventsRouter);
app.use("/",userRouter);
app.use("/",bookingRouter);
app.get("/",(req,res)=>{
    res.redirect("/events");
})
app.get("/map",(req,res)=>{
    res.render("static/map.ejs", { AWS_KEY,AWS_REGION });
})



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
