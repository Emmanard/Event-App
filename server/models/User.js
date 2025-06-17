const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    // Removed idCard field - replaced with phoneNumber
    phoneNumber: {
        type: String,
        required: function() {
            // Make phoneNumber required only for organizers
            return this.role === 'organizer';
        },
        validate: {
            validator: function(v) {
                // Basic phone number validation (adjust regex as needed)
                return !v || /^\+?[\d\s\-\(\)]{10,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    profession: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    image: {
        type: String,
        default: "/users/no-image.jpg",
    },
    followers: {
        type: Array,
    },
    following: {
        type: Array,
    },
    facebookLink: {
        type: String,
    },
    instagramLink: {
        type: String,
    },
    tiktokLink: {
        type: String,
    },
    pinterestLink: {
        type: String,
    },
    twitterLink: {
        type: String,
    },
    webLink: {
        type: String,
    },
    description: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    userID: {
        type: Number,
    },
    resetPassToken: {
        type: String
    }
},
    { timestamps: true }
);

// Index for better query performance
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

userSchema.methods.getJWToken = function () {
    const key = process.env.JWT_SECRET;
    return jwt.sign({ id: this._id, role: this.role, email: this.email }, key, {
        expiresIn: "100d",
    });
};

module.exports = mongoose.model("User", userSchema);