const mongoose = require("mongoose");
const axios = require("axios");

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

const sample = array => array[Math.round(Math.random() * (array.length -1))];

async function seedImg() {
    try {
        const data = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
            client_id: '60NX7SpibLK4QEU7wAxv19GMm2PJ86hFX5JJBf_05VU',
            collections: 483251,
        },   
    })
    return data.data.urls.small
    } catch (err) {
      console.error(err)
    }
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 30; i++) {
        const rand1000 = Math.round(Math.random() * 999)
        const image = await seedImg();
        // const image = "https://images.unsplash.com/photo-1503507026622-bd90164039ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
        const camp = new Campground({
            name: `${sample(descriptors)} ${sample(places)}`,
            author: '6264455d72bff1ef90d2cb42',
            location: `${cities[rand1000].city} - ${cities[rand1000].state}`,
            image: image,
            price: Math.floor(Math.random() * 30) + 10,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem distinctio animi eaque maiores molestias laborum obcaecati adipisci eveniet iste accusamus quod quaerat ab doloribus a, hic sequi suscipit alias praesentium?"
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});

