const trycatch = require('./tryCatch');
const jwt = require("jsonwebtoken");
const User = require('../models/User')

module.exports.protect = (...roles) => trycatch(async (req, res, next) => {
    const jwtoken = req.headers.jwtoken;
    const { id, role } = await jwt.verify(jwtoken, process.env.JWT_SECRET);
    if (roles.includes(role)) {
        if (role == "organizer") {
            const organizer = await User.findOne({ _id: id, role });
            if (!organizer) return res.status(401).json({ authorized: false });
            organizer.role = role;
            req.user = organizer;
            next();
        } else if (role == "attendee") {
            const attendee = await User.findOne({ _id: id, role });

            if (!attendee || !attendee.isActive)
                return res.status(401).json({ authorized: false });
            attendee.role = role;
            req.user = attendee;
            next();
        }
    } else {
        return res.status(403).json({ permission: false });
    }
});
