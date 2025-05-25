const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
    },
    otp: {
        type: Number,
    },
    expiresAt: {
        type: Date,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("UserOTPVerification", userSchema);
