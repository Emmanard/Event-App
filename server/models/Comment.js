const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
    },
    comment: {
        type: String,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    }
},
    { timestamps: true }
);


module.exports = mongoose.model("Comment", userSchema);
