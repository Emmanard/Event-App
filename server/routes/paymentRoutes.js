const express = require('express');
const router = express.Router();
const {
    initializePayment,
    verifyPayment,
    getPaymentStatus,
    getPaymentHistory,
    handleWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth'); // Fixed: Changed to 'middlewares' (plural) to match your project structure

// Payment routes - specify roles that can access each route
router.post('/initialize/:id', protect("organizer", "attendee"), initializePayment);
router.get('/verify/:reference', protect("organizer", "attendee"), verifyPayment);
router.get('/status/:reference', protect("organizer", "attendee"), getPaymentStatus);
router.get('/history', protect("organizer", "attendee"), getPaymentHistory);

// Webhook route (no auth required)
router.post('/webhook', handleWebhook);

module.exports = router;