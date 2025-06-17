const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const OTPverification = require('../models/OTPverification')
const randomstring = require("randomstring");
const fs = require('fs')
const path = require("path");
const { v4: uuidv4 } = require('uuid');



let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    }
});

// register new user
const registerUser = asyncHandler(async (req, res) => {
    const { email, firstName, lastName, fullName, phoneNumber, password, role } = req.body
    if (!email || !fullName || (role == "organizer" && !phoneNumber) || !password) {
        return res.status(400).json({ message: "Please add all fields" })
    }
    
    // Phone number validation for organizers
    if (phoneNumber && role === "organizer") {
        const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            return res.status(400).json({ message: "Please add a valid phone number" })
        }
    }

    try {
        const userExist = await User.findOne({ email })
        if (userExist) {
            return res.status(400).json({ message: "User already exists" })
        }
        
        // Check if phone number already exists for organizers
        if (role === "organizer" && phoneNumber) {
            const phoneExists = await User.findOne({ phoneNumber })
            if (phoneExists) {
                return res.status(400).json({ message: "Phone number already registered" })
            }
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        let count = await User.find().sort({
            userID: -1
        });
        let userId = count.length > 0 ? count[0].userID : 0;
        userId += 1;

        const user = await User.create({
            email,
            firstName,
            lastName,
            fullName,
            phoneNumber,
            role,
            userID: userId,
            password: hashedPassword,
        })

        // send otp email
        let otp = `${Math.floor(1000 + Math.random() * 9000)}`
        const mailOptions = {
            from: {
                name: "Event Wave",
                address: process.env.EMAIL_USER,
            },
            to: email,
            subject: "Verify Your Email",
            html: `<p>Your OTP verification code is: <b>${otp}</b>
                <br />
                    Please enter OTP in the app to verify your email address.</p>
                    <p>This code <b>expires in 1 hour </b></p>
                    `
        }
        const newOTPVerification = new OTPverification({
            userID: user._id,
            otp,
            expiresAt: Date.now() + 3600000,
        });
        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);

        let data = {
            email: user.email,
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            userID: user.userID,
            role: user.role,
        }
        if (data) {
            return res.status(200).json({ success: true, data, msg: "Verification OTP Email Sent." })
        }

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

});
//login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user.isVerified) {
        return res.status(403).json({ message: "Please verify your email." })
    }
    if (user && (await bcrypt.compare(password, user.password))) {
        let jwtoken = user.getJWToken();
        user.isActive = true;
        user.save();

        let data = {
            email: user.email,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            userID: user.userID,
            phoneNumber: user.phoneNumber, // Changed from idCard to phoneNumber
            role: user.role
        }

        return res.status(200).json({ success: true, jwtoken, data, msg: "User logged in successfully" })
    } else {
        return res.status(400).json({ message: "Invalid User Data. Please check your email and password" })
    }
})


const verifyOTP = asyncHandler(async (req, res) => {
    let { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Please add OTP details" })
    }
    let user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "This email is not registered." })
    }
    if (user.isVerified) {
        return res.status(400).json({ message: "This email is already verified." })
    }

    const otpVerify = await OTPverification.find({ userID: user._id }).sort({ createdAt: -1 });
    if (otpVerify.length <= 0) {
        return res.status(404).json({ message: "No record found for this user." })
    } else {
        const { expiresAt } = otpVerify[0];
        const hashedOTP = otpVerify[0].otp;

        if (expiresAt < Date.now()) {
            await OTPverification.deleteMany({ userID: user._id });
            return res.status(400).json({ message: "Code is expired. Please generate again." })
        } else {
            if (Number(otp) !== Number(hashedOTP)) {
                return res.status(400).json({ message: "Invalid OTP. Please check inbox." })
            } else {
                await User.updateOne({ _id: user._id }, { isVerified: true });
                await OTPverification.deleteMany({ userID: user._id });
                return res.status(200).json({ msg: "User email verified." })
            }
        }
    }

});

// resend OTP
const resendOTP = asyncHandler(async (req, res) => {
    let { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Please add email address." })
    }
    let user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "This email is not registered." })
    } else {
        await OTPverification.deleteMany({ userID: user._id });
        // send otp email
        let otp = `${Math.floor(1000 + Math.random() * 9000)}`
        const mailOptions = {
            from: {
                name: "Event Wave",
                address: process.env.EMAIL_USER,
            },
            to: email,
            subject: "Verify Your Email",
            html: `<p>Your OTP verification code is: <b>${otp}</b>
                <br />
                    Please enter OTP in the app to verify your email address.</p>
                    <p>This code <b>expires in 1 hour </b></p>
                    `
        }
        const newOTPVerification = new OTPverification({
            userID: user._id,
            otp,
            expiresAt: Date.now() + 3600000,
        });
        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, msg: "Verification OTP Email Sent." })

    }
});

// forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    let user = await User.findOne({ email });
    
    if (!user) {
        return res.status(404).json({ success: false, message: "This email does not exist" });
    }

    const randomString = randomstring.generate();
    await User.updateOne({ email }, { $set: { resetPassToken: randomString } });

    // Use FRONTEND_URL since the link should point to your React app
    const frontendUrl = process.env.FRONTEND_URL;
    const resetUrl = `${frontendUrl}/auth/reset-password/${randomString}/${email}`;

    const mailOptions = {
        from: {
            name: "Event Wave",
            address: process.env.EMAIL_USER,
        },
        to: email,
        subject: "Reset your password",
        html: `<p>Hi ${user.fullName}!
                    <br />
                    We noticed that you requested a password reset for your EventWave account. To proceed, please click on the following link to reset your password:
                    <br/>
                    <a href="${resetUrl}">Reset Password</a>
                 </p>
                 <p>
                    For security reasons, please do not share this email with anyone.
                    <br/>
                    Thank you for using EventWave.
                    <br/>
                    Best regards,
                    The EventWave Team
                 </p>`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, msg: "Please check your inbox." });
});

// reset password
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email, resetPassToken: token });
        if (!user) {
            return res.status(400).json({ success: false, message: "User data invalid. Re-check your inbox" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword, $unset: { resetPassToken: 1 }, new: true },
        );

        return res.status(200).json({ success: true, msg: "Password changed successfully!" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })

    }
})


// get user data
const getUser = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json({ data: req.user })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})


const updateUser = asyncHandler(async (req, res) => {
    let { id } = req.query;
    try {
        // If phoneNumber is being updated, validate it
        if (req.body.phoneNumber) {
            const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
            if (!phoneRegex.test(req.body.phoneNumber.replace(/\s/g, ''))) {
                return res.status(400).json({ message: "Please add a valid phone number" })
            }
            
            // Check if phone number already exists for other users
            const phoneExists = await User.findOne({ 
                phoneNumber: req.body.phoneNumber, 
                _id: { $ne: id } 
            });
            if (phoneExists) {
                return res.status(400).json({ message: "Phone number already registered" })
            }
        }

        // Remove idCard from update data if it exists
        if (req.body.idCard) {
            delete req.body.idCard;
        }

        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true })
        if (updatedUser) {
            return res.status(201).json({ success: true, msg: "User updated successfully!" })
        } else {
            return res.status(400).json({ error: "Invalid User Data" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// update user password
const updateUserPassword = asyncHandler(async (req, res) => {
    let { id, oldPassword, password } = req.query;
    try {
        let user = await User.findById(id);

        let checkPass = await bcrypt.compare(oldPassword, user.password);
        if (checkPass) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
            user.save();
            return res.status(200).json({ success: true, msg: "Password changed successfully!" })
        } else {
            return res.status(400).json({ success: false, message: "Your old password doesn't match" })
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})



module.exports = {
    registerUser,
    loginUser,
    updateUser,
    updateUserPassword,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    getUser,
}
