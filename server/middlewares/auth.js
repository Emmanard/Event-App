// Corrected protect middleware
const trycatch = require('./tryCatch');
const jwt = require("jsonwebtoken");
const User = require('../models/User');

module.exports.protect = (...roles) => trycatch(async (req, res, next) => {
    // 1. Get token and verify it
    const jwtoken = req.headers.jwtoken;
    if (!jwtoken) {
        return res.status(401).json({ authorized: false, message: 'No token provided' });
    }

    let decoded;
    try {
        decoded = jwt.verify(jwtoken, process.env.JWT_SECRET);
    } catch (err) {
        // If token is invalid or expired
        return res.status(401).json({ authorized: false, message: 'Invalid or expired token' });
    }

    // 2. Find the user in the database
    const user = await User.findById(decoded.id);
    if (!user || (user.role !== 'attendee' && user.role !== 'organizer')) {
        return res.status(401).json({ authorized: false, message: 'User not found or role is invalid' });
    }

    // 3. Attach the user object to the request
    req.user = user;

    // 4. Check for role-based authorization
    if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ permission: false, message: 'Access denied' });
    }

    // 5. Proceed to the next middleware/controller
    next();
});