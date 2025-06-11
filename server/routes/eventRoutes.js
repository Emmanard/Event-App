const router = require("express").Router();
const {
    addEvent,
    getMyEvents,
    delEvent,
    getEvent,
    updateEvent,
    getPopularEvents,
    addView,
    addLike,
    addComment,
    getComments,
    deleteComment,
    searchEvents,
    getEventsByCategory,
    getEventCategories,
    getFeaturedEvents,
    getUpcomingEvents,
    getEventStats,
    reportEvent,
    bookmarkEvent,
    getBookmarkedEvents,
    shareEvent,
    removeLike,
    updateComment,
    // Add the new functions to imports
    getAllEvents,
    getPopularEventsAll,
    getPopularEventsSimple,
      bookEvent,
    bookEventSingle,
    cancelBooking,
    getMyBookedEvents,
    checkBookingStatus,
    getEventAttendees
} = require('../controllers/events');
const { protect } = require("../middlewares/auth");

 // ================================
// CORE BOOKING  ROUTES
// ================================
// Enhanced booking route (supports both single and bulk booking with form data)
router.post('/book/:id', protect("attendee"), bookEvent);

// Legacy single booking route (for backward compatibility)
router.post('/book-single/:id', protect("attendee"), bookEventSingle);

// Cancel booking - FIXED: Updated route path and middleware
router.delete('/book/:id', protect("attendee"), cancelBooking);

// Get user's booked events
router.get('/my-bookings', protect("attendee"), getMyBookedEvents);

// Check booking status for an event - FIXED: Updated route path
router.get('/booking-status/:id', protect("attendee"), checkBookingStatus);

// Get event attendees (for organizers only)
router.get('/attendees/:id', protect("organizer"), getEventAttendees);

// ================================
// CORE EVENT MANAGEMENT ROUTES
// ================================

// Add new event
router.route("/add")
    .post(protect("organizer"), addEvent);

// Get organizer's events
router.route("/getMyEvents")
    .get(protect("organizer"), getMyEvents);

// Basic event operations (get, update, delete)
router.route("/")
    .delete(protect("organizer"), delEvent)
    .get(protect("organizer", "attendee"), getEvent)
    .put(protect("organizer"), updateEvent);

// Get popular events by type (existing function)
router.route("/popular/:type")
    .get(getPopularEvents);

// ================================
// NEW ROUTES FOR GET ALL EVENTS AND POPULAR EVENTS
// ================================

// Get all events with filtering and pagination
router.route("/all")
    .get(getAllEvents);

// Get popular events across all categories (advanced version)
router.route("/popular")
    .get(getPopularEventsAll);

// Get popular events across all categories (simple version)
router.route("/popular-simple")
    .get(getPopularEventsSimple);

// ================================
// EVENT INTERACTION ROUTES
// ================================

// Event views
router.route("/addView")
    .put(protect("organizer", "attendee"), addView);

// Event likes
router.route("/addLike")
    .put(protect("organizer", "attendee"), addLike);

router.route("/removeLike")
    .put(protect("organizer", "attendee"), removeLike);

// Event comments
router.route("/comment")
    .post(protect("organizer", "attendee"), addComment)
    .get(protect("organizer", "attendee"), getComments)
    .delete(protect("organizer", "attendee"), deleteComment);

router.route("/comment/update")
    .put(protect("organizer", "attendee"), updateComment);

// ================================
// SEARCH AND DISCOVERY ROUTES
// ================================

// Basic search
router.route("/search")
    .get(searchEvents);

// Advanced search with comprehensive filters - FIXED: Added missing Event import
router.route("/advanced-search")
    .get(async (req, res) => {
        try {
            // Import Event model at the top of the file or here
            const Event = require('../models/Event');
            
            const {
                q,
                category,
                location,
                dateFrom,
                dateTo,
                priceMin,
                priceMax,
                sortBy = 'relevance',
                page = 1,
                limit = 10
            } = req.query;
            
            let query = { status: 'published' };
            
            // Text search across multiple fields
            if (q) {
                query.$or = [
                    { title: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { location: { $regex: q, $options: 'i' } }
                ];
            }
            
            // Category filter
            if (category) {
                query.category = category;
            }
            
            // Location filter
            if (location) {
                query.location = { $regex: location, $options: 'i' };
            }
            
            // Date range filter
            if (dateFrom || dateTo) {
                query.date = {};
                if (dateFrom) query.date.$gte = new Date(dateFrom);
                if (dateTo) query.date.$lte = new Date(dateTo);
            }
            
            // Price range filter
            if (priceMin || priceMax) {
                query.price = {};
                if (priceMin) query.price.$gte = parseFloat(priceMin);
                if (priceMax) query.price.$lte = parseFloat(priceMax);
            }
            
            // Dynamic sorting
            let sort = {};
            switch (sortBy) {
                case 'date-asc':
                    sort = { date: 1 };
                    break;
                case 'date-desc':
                    sort = { date: -1 };
                    break;
                case 'price-low':
                    sort = { price: 1 };
                    break;
                case 'price-high':
                    sort = { price: -1 };
                    break;
                case 'popular':
                    sort = { likes: -1, views: -1 };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
                default:
                    sort = { createdAt: -1 };
            }
            
            const skip = (page - 1) * limit;
            
            const events = await Event.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('organizer', 'name');
                
            const total = await Event.countDocuments(query);
            
            res.json({
                success: true,
                data: events,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// Category-based routes
router.route("/category")
    .get(getEventsByCategory);

router.route("/categories")
    .get(getEventCategories);

// Featured and upcoming events
router.route("/featured")
    .get(getFeaturedEvents);

router.route("/upcoming")
    .get(getUpcomingEvents);

// ================================
// USER INTERACTION ROUTES
// ================================

// Event bookmarking
router.route("/bookmark")
    .put(protect("organizer", "attendee"), bookmarkEvent);

router.route("/bookmarks")
    .get(protect("organizer", "attendee"), getBookmarkedEvents);

// Event sharing
router.route("/share")
    .post(protect("organizer", "attendee"), shareEvent);

// Event reporting
router.route("/report")
    .post(protect("organizer", "attendee"), reportEvent);

// ================================
// EVENT ATTENDANCE MANAGEMENT
// ================================

// Event attendance - FIXED: Added missing Event import
router.route("/attend/:id")
    .post(protect("attendee"), async (req, res) => {
        try {
            const Event = require('../models/Event');
            
            const event = await Event.findById(req.params.id);
            if (!event) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            
            const userId = req.user._id;
            
            // Check if user already attending
            if (event.attendees && event.attendees.includes(userId)) {
                return res.status(400).json({ success: false, message: 'Already registered for this event' });
            }
            
            // Add user to attendees
            event.attendees = event.attendees || [];
            event.attendees.push(userId);
            await event.save();
            
            res.json({ success: true, message: 'Successfully registered for event' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    })
    .delete(protect("attendee"), async (req, res) => {
        try {
            const Event = require('../models/Event');
            
            const event = await Event.findById(req.params.id);
            if (!event) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            
            const userId = req.user._id;
            
            // Remove user from attendees
            event.attendees = event.attendees.filter(id => !id.equals(userId));
            await event.save();
            
            res.json({ success: true, message: 'Successfully unregistered from event' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// Get user's attended events
router.route("/my-attended")
    .get(protect("attendee"), async (req, res) => {
        try {
            const Event = require('../models/Event');
            
            const events = await Event.find({
                attendees: req.user._id
            }).populate('organizer', 'name');
            
            res.json({ success: true, data: events });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// ================================
// ANALYTICS AND INSIGHTS
// ================================

// General event statistics
router.route("/stats")
    .get(protect("organizer", "attendee"), getEventStats);

// Detailed event analytics for organizers
router.route("/analytics/:id")
    .get(protect("organizer"), async (req, res) => {
        try {
            const Event = require('../models/Event');
            
            const event = await Event.findOne({ 
                _id: req.params.id, 
                organizer: req.user._id 
            }).populate('views likes comments');
            
            if (!event) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            
            // Calculate comprehensive analytics
            const analytics = {
                totalViews: event.views.length,
                totalLikes: event.likes.length,
                totalComments: event.comments.length,
                totalAttendees: event.attendees ? event.attendees.length : 0,
                viewsThisWeek: event.views.filter(view => 
                    new Date(view.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length,
                likesThisWeek: event.likes.filter(like => 
                    new Date(like.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length,
                commentsThisWeek: event.comments.filter(comment => 
                    new Date(comment.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length,
                engagementRate: ((event.likes.length + event.comments.length) / Math.max(event.views.length, 1) * 100).toFixed(2),
                conversionRate: ((event.attendees ? event.attendees.length : 0) / Math.max(event.views.length, 1) * 100).toFixed(2)
            };
            
            res.json({ success: true, data: analytics });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// ================================
// PERSONALIZATION ROUTES
// ================================

// Event recommendations based on user preferences
router.route("/recommendations")
    .get(protect("organizer", "attendee"), async (req, res) => {
        try {
            const Event = require('../models/Event');
            
            const userId = req.user._id;
            const limit = parseInt(req.query.limit) || 5;
            
            // Get user's liked events to understand preferences
            const userLikes = await Event.find({ likes: userId }).select('category');
            const preferredCategories = [...new Set(userLikes.map(event => event.category))];
            
            let recommendations;
            if (preferredCategories.length > 0) {
                // Recommend based on user preferences
                recommendations = await Event.find({
                    category: { $in: preferredCategories },
                    date: { $gte: new Date() },
                    status: 'published',
                    organizer: { $ne: userId } // Don't recommend own events
                })
                .sort({ likes: -1, views: -1 })
                .limit(limit)
                .populate('organizer', 'name');
            } else {
                // Recommend popular events
                recommendations = await Event.find({
                    date: { $gte: new Date() },
                    status: 'published',
                    organizer: { $ne: userId }
                })
                .sort({ likes: -1, views: -1 })
                .limit(limit)
                .populate('organizer', 'name');
            }
            
            res.json({ success: true, data: recommendations });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// ================================
// BULK OPERATIONS
// ================================

// Bulk event operations for organizers
router.route("/bulk")
    .post(protect("organizer"), async (req, res) => {
        try {
            const Event = require('../models/Event');
            
            const { action, eventIds } = req.body;
            
            if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
                return res.status(400).json({ success: false, message: 'Event IDs are required' });
            }
            
            switch (action) {
                case 'delete':
                    await Event.deleteMany({ 
                        _id: { $in: eventIds }, 
                        organizer: req.user._id 
                    });
                    break;
                case 'publish':
                    await Event.updateMany(
                        { _id: { $in: eventIds }, organizer: req.user._id },
                        { status: 'published' }
                    );
                    break;
                case 'unpublish':
                    await Event.updateMany(
                        { _id: { $in: eventIds }, organizer: req.user._id },
                        { status: 'draft' }
                    );
                    break;
                case 'feature':
                    await Event.updateMany(
                        { _id: { $in: eventIds }, organizer: req.user._id },
                        { featured: true }
                    );
                    break;
                case 'unfeature':
                    await Event.updateMany(
                        { _id: { $in: eventIds }, organizer: req.user._id },
                        { featured: false }
                    );
                    break;
                default:
                    return res.status(400).json({ success: false, message: 'Invalid action' });
            }
            
            res.json({ success: true, message: `${action} completed successfully for ${eventIds.length} events` });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// ================================
// EVENT MANAGEMENT UTILITIES
// ================================

// Clone/duplicate event
router.route("/clone/:id")
    .post(protect("organizer"), async (req, res) => {
        try {
            const Event = require('../models/Event');
            
            const originalEvent = await Event.findOne({
                _id: req.params.id,
                organizer: req.user._id
            });
            
            if (!originalEvent) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            
            // Create a copy
            const eventData = originalEvent.toObject();
            delete eventData._id;
            delete eventData.views;
            delete eventData.likes;
            delete eventData.comments;
            delete eventData.attendees;
            delete eventData.createdAt;
            delete eventData.updatedAt;
            
            // Modify title and status for the copy
            eventData.title = `${eventData.title} (Copy)`;
            eventData.status = 'draft';
            
            const clonedEvent = new Event(eventData);
            await clonedEvent.save();
            
            res.json({ 
                success: true, 
                data: clonedEvent,
                message: 'Event cloned successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// Event status management
router.route("/status/:id")
    .put(protect("organizer"), async (req, res) => {
        try {
            const Event = require('../models/Event');
            
            const { status } = req.body;
            const validStatuses = ['draft', 'published', 'cancelled', 'completed'];
            
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
                });
            }
            
            const event = await Event.findOneAndUpdate(
                { _id: req.params.id, organizer: req.user._id },
                { status },
                { new: true }
            );
            
            if (!event) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            
            res.json({ 
                success: true, 
                data: event,
                message: `Event status updated to ${status}`
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

module.exports = router;