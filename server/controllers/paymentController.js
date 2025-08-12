const axios = require('axios');
const crypto = require('crypto');
const Event = require('../models/Event');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';

// Helper function to calculate processing fees
const calculateProcessingFee = (amount, percentage = 1.5, minimumFee = 100) => {
    const fee = Math.max(amount * (percentage / 100), minimumFee);
    return Math.round(fee);
};

// Helper function to generate payment reference
const generatePaymentReference = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 8);
    return `EVT_${timestamp}_${random}`.toUpperCase();
};

// ... (rest of the code)
const initializePayment = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const userId = req.user._id;
        const { quantity = 1, fullName, email, phone } = req.body;

        console.log('Initialize payment:', { eventId, userId, quantity, fullName, email });

        // --- Critical Fix 1: Check if the event exists before using the 'event' variable ---
        // This prevents the "ReferenceError: event is not defined" issue.
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found.'
            });
        }
        
        // --- Existing Validation Logic ---
        // Check if event is bookable
        if (event.status !== 'Published') {
            return res.status(400).json({
                success: false,
                message: 'Event is not available for booking.'
            });
        }

        if (new Date(event.date) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book past events.'
            });
        }

        // Check seat availability
        const availableSeats = event.seats - (event.seatsBooked?.length || 0);
        if (availableSeats < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableSeats} seats available.`
            });
        }

        // Convert the price to kobo on the backend for security
        const amountInKobo = event.ticketPrice * quantity * 100;
        const paymentReference = generatePaymentReference();

        console.log('DEBUG: Attempting to initialize payment with Paystack...');

        // --- Fix 2: Robust Paystack API Call with specific error handling ---
        // We define the variable outside the try block so it's accessible later.
        let paystackResponse;
        try {
            paystackResponse = await axios.post(
                `${PAYSTACK_BASE_URL}/transaction/initialize`,
                {
                    email,
                    amount: amountInKobo,
                    reference: paymentReference,
                    callback_url: `${process.env.FRONTEND_URL}/payment-verification`,
                    metadata: {
                        fullName,
                        phone,
                        userId,
                        eventId
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (axiosError) {
            console.error('DEBUG: Error from Paystack API:', axiosError.response?.data || axiosError.message);
            // Return a generic error to the user if the Paystack API call fails.
            return res.status(500).json({
                success: false,
                message: "Failed to connect to payment gateway."
            });
        }

        console.log('DEBUG: Paystack response received:', paystackResponse.data);

        // Now we can safely check the paystackResponse object and its data
        if (!paystackResponse || !paystackResponse.data || !paystackResponse.data.status) {
            return res.status(400).json({
                success: false,
                message: paystackResponse?.data?.message || 'Payment initialization failed from API.'
            });
        }

        // Create a new payment record in your database
        const newPayment = new Payment({
            reference: paymentReference,
            eventId,
            userId,
            amount: amountInKobo / 100,
            bookingDetails: {
                fullName,
                email,
                phone,
                quantity
            },
            status: 'pending',
            paystackResponse: paystackResponse.data
        });
        await newPayment.save();

        const responseToSend = {
            success: true,
            message: 'Payment initialized successfully',
            data: {
                paymentUrl: paystackResponse.data.data.authorization_url,
                reference: paymentReference,
                amount: amountInKobo / 100,
                eventTitle: event.title
            }
        };

        console.log('Final response sent to client:', JSON.stringify(responseToSend, null, 2));

        res.status(200).json(responseToSend);

    } catch (error) {
        console.error('Initialize payment error:', error);
        // This catch block handles any other unexpected errors.
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
// Verify Payment and Complete Booking
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        console.log('Verify payment:', reference);

        // Find payment record
        const payment = await Payment.findOne({ reference }).populate('eventId userId');
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Verify with Paystack
        const verificationResponse = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        console.log('Paystack verification response:', verificationResponse.data);

        if (verificationResponse.data.status && verificationResponse.data.data.status === 'success') {
            // Payment successful - complete booking
            const event = payment.eventId;
            const bookingDetails = payment.bookingDetails;

            // Double-check seat availability before booking
            const currentAvailableSeats = event.seats - (event.seatsBooked?.length || 0);
            if (currentAvailableSeats < bookingDetails.quantity) {
                await Payment.findByIdAndUpdate(payment._id, {
                    status: 'failed',
                    paystackResponse: verificationResponse.data
                });

                return res.status(400).json({
                    success: false,
                    message: 'Seats no longer available. Payment will be refunded.',
                    shouldRefund: true
                });
            }

            // Create booking entries
            const bookingEntries = [];
            for (let i = 0; i < bookingDetails.quantity; i++) {
                bookingEntries.push({
                    userId: payment.userId._id,
                    fullName: bookingDetails.fullName,
                    email: bookingDetails.email,
                    phone: bookingDetails.phone,
                    bookingDate: new Date(),
                    seatNumber: event.seatsBooked.length + i + 1,
                    paymentReference: reference,
                    paymentStatus: 'paid'
                });
            }

            // Add bookings to event
            event.seatsBooked.push(...bookingEntries);
            await event.save();

            // Update payment status
            payment.status = 'successful';
            payment.paystackResponse = verificationResponse.data;
            await payment.save();

            console.log('Booking completed successfully');

            res.json({
                success: true,
                message: `Successfully booked ${bookingDetails.quantity} seat(s)!`,
                data: {
                    paymentReference: reference,
                    eventId: event._id,
                    eventTitle: event.title,
                    bookingQuantity: bookingDetails.quantity,
                    totalAmount: payment.amount,
                    seatNumbers: bookingEntries.map(entry => entry.seatNumber),
                    bookedSeats: event.seatsBooked.length,
                    availableSeats: event.seats - event.seatsBooked.length,
                    bookingDetails: bookingEntries,
                    paymentDetails: {
                        reference,
                        amount: payment.amount,
                        status: 'successful',
                        paidAt: verificationResponse.data.data.paid_at
                    }
                }
            });

        } else {
            // Payment failed
            await Payment.findByIdAndUpdate(payment._id, {
                status: 'failed',
                paystackResponse: verificationResponse.data
            });

            res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                error: verificationResponse.data.data.gateway_response || 'Payment was not successful'
            });
        }

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Payment Status
const getPaymentStatus = async (req, res) => {
    try {
        const { reference } = req.params;

        const payment = await Payment.findOne({ reference })
            .populate('eventId', 'title date image')
            .populate('userId', 'fullName email');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: {
                reference: payment.reference,
                status: payment.status,
                amount: payment.amount,
                bookingDetails: payment.bookingDetails,
                event: payment.eventId,
                user: payment.userId,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt
            }
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get User Payment History
const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const query = { userId };
        if (status) {
            query.status = status;
        }

        const payments = await Payment.find(query)
            .populate('eventId', 'title date image location')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Payment.countDocuments(query);

        res.json({
            success: true,
            data: {
                payments,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });

    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Paystack Webhook Handler (Optional - for additional security)
const handleWebhook = async (req, res) => {
    try {
        const hash = req.headers['x-paystack-signature'];
        const body = JSON.stringify(req.body);
        const expectedHash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(body).digest('hex');

        if (hash !== expectedHash) {
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const reference = event.data.reference;

            // Update payment status
            await Payment.findOneAndUpdate(
                { reference },
                {
                    status: 'successful',
                    paystackResponse: event.data
                }
            );

            console.log(`Webhook: Payment ${reference} confirmed as successful`);
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error processing webhook');
    }
};

module.exports = {
    initializePayment,
    verifyPayment,
    getPaymentStatus,
    getPaymentHistory,
    handleWebhook,
    Payment // Export model for use in other controllers
};