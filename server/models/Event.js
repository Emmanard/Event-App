const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    location: {
        type: String,
    },
    date: {
        type: Date,
    },
    time: {
        type: Array,
    },
    organizerInfo: {
        type: String,
    },
    eventRules: {
        type: String,
    },
    schedule: [
        {
            time: String,
            details: String
        }
    ],
    speakers: [
        {
            name: String,
            profession: String,
            details: String,
            img: String,
        }
    ],
    ticketPrice: {
        type: Number,
    },
    tags: {
        type: String,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        default: "Draft"
    },
    seats: {
        type: Number,
    },
    image: {
        type: String,
        default: "/events/no-image.jpg",
    },
    seatsBooked: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        default: []
    },
    views: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        default: []
    },
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        default: []
    },
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        default: []
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"

    }


},
    { timestamps: true }
);


module.exports = mongoose.model("Event", userSchema);
