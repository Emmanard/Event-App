const router = require("express").Router();
const {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    getUser,
    updateUser,
    updateUserPassword,
} = require('../controllers/user');
const { protect } = require("../middlewares/auth");


router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/verifyOTP', verifyOTP)
router.post('/resendOTP', resendOTP)
router.post('/forgotPassword', forgotPassword)
router.put('/resetPassword', resetPassword)

// user management
router.route("/getUser")
    .get(protect("organizer", "attendee"), getUser);

router.route("/updateUser")
    .put(protect("organizer", "attendee"), updateUser);
router.route("/updateUserPassword")
    .put(protect("organizer", "attendee"), updateUserPassword);




module.exports = router;