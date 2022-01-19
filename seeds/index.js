const mongoose = require("mongoose");

const cities = require("./cities");
const {places, descriptors } = require("./seedHelpers");

const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

.then(() => {
    console.log("Mongo OPEN");
})
.catch((err) => {
    console.log("Mongo ERROR");
    console.log(err);
})

const sample = array => array[Math.round(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 30; i++) {
        const rand1000 = Math.round(Math.random() * 999)
        const camp = new Campground({
            name: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city} - ${cities[rand1000].state}`
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});

