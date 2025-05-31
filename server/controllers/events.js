const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Comment = require('../models/Comment');
const User = require('../models/User');
const mongoose = require('mongoose');

// Add new event
const addEvent = asyncHandler(async (req, res) => {
    let bodyData = req.body;
    try {
        if (!bodyData.title || !bodyData.category || !bodyData.country || !bodyData.city || !bodyData.location || !bodyData.date || !bodyData.time.length || !bodyData.ticketPrice || !bodyData.seats) {
            return res.status(400).json({ success: false, message: "title, category, country, city, location, date, time, ticket price and seats are required." })
        }
        let body = { ...bodyData, addedBy: req.user._id, status: 'Published' }
        let event = await Event.create(body);
        if (event) {
            return res.status(200).json({ success: true, msg: "Event added successfully!", event });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get my events
const getMyEvents = async (req, res) => {
    try {
        let data = await Event.find({
            $and: [
                { addedBy: req.user._id },
                { status: { $ne: "Deleted" } }
            ]
        })
            .sort({ createdAt: -1 });
        if (data) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Delete event 
const delEvent = async (req, res) => {
    let { id } = req.query;
    try {
        let event = await Event.findById(id);
        if (event) {
            event.status = "Deleted";
            await event.save();
            return res.status(200).json({ success: true, msg: "Event deleted successfully!" })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Get single event
const getEvent = async (req, res) => {
    let { id } = req.query;
    try {
        let event = await Event.findById(id)
            .populate("addedBy");
        if (event) {
            return res.status(200).json({ success: true, data: event })
        } else {
            return res.status(404).json({ success: false, message: "No event found" })
        }
    } catch (error) {
        console.log('checking=>', error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Update event 
const updateEvent = async (req, res) => {
    let { id } = req.query;
    try {
        let body = req.body;
        let event = await Event.findByIdAndUpdate(id, body, { new: true });
        if (event) {
            return res.status(200).json({ success: true, msg: "Event Updated successfully!" })
        } else {
            return res.status(400).json({ success: false, message: "No event found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Enhanced search functionality
const searchEvents = async (req, res) => {
    try {
        const { q, limit = 10, page = 1 } = req.query;
        
        if (!q) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }
        
        const skip = (page - 1) * limit;
        
        const searchQuery = {
            status: 'Published',
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } },
                { city: { $regex: q, $options: 'i' } },
                { country: { $regex: q, $options: 'i' } }
            ]
        };
        
        const events = await Event.find(searchQuery)
            .populate('addedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Event.countDocuments(searchQuery);
        
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
};

// Get events by category with advanced filtering
const getEventsByCategory = async (req, res) => {
    try {
        const { 
            category, 
            page = 1, 
            limit = 10, 
            sortBy = 'popular',
            dateFrom,
            dateTo,
            priceMin,
            priceMax,
            location
        } = req.query;
        
        if (!category) {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }
        
        let query = { 
            category: category.toLowerCase(),
            status: 'Published',
            date: { $gte: new Date() } // Only future events
        };
        
        // Date range filter
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = new Date(dateFrom);
            if (dateTo) query.date.$lte = new Date(dateTo);
        }
        
        // Price range filter
        if (priceMin !== undefined || priceMax !== undefined) {
            query.ticketPrice = {};
            if (priceMin !== undefined) query.ticketPrice.$gte = parseFloat(priceMin);
            if (priceMax !== undefined) query.ticketPrice.$lte = parseFloat(priceMax);
        }
        
        // Location filter
        if (location) {
            query.$or = [
                { location: { $regex: location, $options: 'i' } },
                { city: { $regex: location, $options: 'i' } },
                { country: { $regex: location, $options: 'i' } }
            ];
        }
        
        // Sorting options
        let sort = {};
        switch (sortBy) {
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            case 'date':
                sort = { date: 1 };
                break;
            case 'price-low':
                sort = { ticketPrice: 1 };
                break;
            case 'price-high':
                sort = { ticketPrice: -1 };
                break;
            case 'alphabetical':
                sort = { title: 1 };
                break;
            case 'popular':
            default:
                // Sort by engagement (likes + views)
                sort = { likes: -1, views: -1, createdAt: -1 };
                break;
        }
        
        const skip = (page - 1) * limit;
        
        const events = await Event.find(query)
            .populate('addedBy', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
            
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
};

// Get all available event categories
const getEventCategories = async (req, res) => {
    try {
        const categories = await Event.distinct('category', { status: 'Published' });
        
        // Get category counts
        const categoryCounts = await Event.aggregate([
            { $match: { status: 'Published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        const categoriesWithCounts = categoryCounts.map(cat => ({
            name: cat._id,
            count: cat.count,
            displayName: cat._id.charAt(0).toUpperCase() + cat._id.slice(1)
        }));
        
        res.json({ success: true, data: categoriesWithCounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get popular events by type (keeping your existing logic)
const getPopularEvents = async (req, res) => {
    const { type } = req.params;
    try {
        console.log('Searching for events with category:', type);
        
        const events = await Event.aggregate([
            { $match: { category: type, status: "Published" } },
            { $addFields: { viewsLength: { $size: "$views" } } },
            { $sort: { viewsLength: -1 } },
            { $limit: 6 },
        ]);

        console.log('Found events:', events.length);

        return res.status(200).json({ 
            success: true, 
            data: events,
            message: events.length === 0 ? `No events found for category: ${type}` : undefined
        });
        
    } catch (error) {
        console.error('Error in getPopularEvents:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Get featured events
const getFeaturedEvents = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        // Featured events are those with high engagement and upcoming dates
        const events = await Event.find({
            status: 'Published',
            date: { $gte: new Date() }
        })
        .populate('addedBy', 'name email')
        .sort({ 
            likes: -1, 
            views: -1, 
            createdAt: -1 
        })
        .limit(parseInt(limit));
        
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const events = await Event.find({
            status: 'Published',
            date: { $gte: new Date() }
        })
        .populate('addedBy', 'name email')
        .sort({ date: 1 })
        .limit(parseInt(limit));
        
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add view to event (keeping your existing logic)
const addView = async (req, res) => {
    const { id } = req.query;
    try {
        const event = await Event.findById(id);

        if (event) {
            let checkView = event?.views?.some(item => item.equals(req.user._id));
            if (!checkView) {
                event.views.push(req?.user?._id);
                await event.save()
                return res.status(200).json({ success: true, })
            }
        } else {
            return res.status(404).json({ success: false, })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// Add/remove like to event (keeping your existing logic)
const addLike = async (req, res) => {
    const { id } = req.query;
    try {
        const event = await Event.findById(id);

        if (event) {
            let checkLike = event?.likes?.some(item => item.equals(req.user._id));
            if (!checkLike) {
                event.likes.push(req?.user?._id);
                await event.save()
                return res.status(200).json({ success: true, msg: "Event liked successfully!" })
            } else {
                let filtered = event?.likes?.filter(item => item.toString() !== req.user._id.toString());
                event.likes = filtered;
                await event.save()
                return res.status(200).json({ success: true, msg: "Event disliked successfully!" })
            }
        } else {
            return res.status(404).json({ success: false, message: "Event not exists" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// Remove like from event (alternative method)
const removeLike = async (req, res) => {
    try {
        const { id } = req.query;
        const userId = req.user._id;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        if (!event.likes) event.likes = [];
        
        event.likes = event.likes.filter(like => !like.equals(userId));
        await event.save();
        
        res.json({ success: true, message: 'Like removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add comment to event (keeping your existing logic)
const addComment = async (req, res) => {
    const { id } = req.query;
    try {
        const event = await Event.findById(id);

        if (event) {
            let body = { ...req.body, addedBy: req.user._id, eventId: event?._id }
            const comment = await Comment.create(body);
            event.comments.push(comment?._id);
            await event.save()
            return res.status(200).json({ success: true, msg: "Comment added successfully!" })
        } else {
            return res.status(404).json({ success: false, message: "Event not exists" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// Get comments for event (keeping your existing logic)
const getComments = async (req, res) => {
    let { limit, page, id } = req.query;
    if (!limit) limit = 10;
    if (!page) page = 1;
    limit = parseInt(limit);
    let skip = limit * (page - 1);

    try {
        const comments = await Comment.find({ eventId: id })
            .populate("addedBy eventId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const commentsCount = await Comment.find({ eventId: id });

        if (comments.length > 0) {
            return res.status(200).json({ success: true, data: comments, count: commentsCount.length })
        } else {
            return res.status(404).json({ success: false, message: "No comments found" })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// Delete comment (keeping your existing logic)
const deleteComment = async (req, res) => {
    let { id } = req.query;

    try {
        const comment = await Comment.findById(id);

        if (comment) {
            if (comment?.addedBy.toString() == req.user._id.toString()) {
                await Comment.findByIdAndDelete(id)
                return res.status(200).json({ success: true, msg: "Comment deleted successfully!" })
            } else {
                return res.status(404).json({ success: false, message: "You can delete your own comments." })
            }
        } else {
            return res.status(404).json({ success: false, message: "No comment found" })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// Update comment
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.query;
        const { content } = req.body;
        const userId = req.user._id;
        
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        
        // Check if user owns the comment
        if (!comment.addedBy.equals(userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        
        comment.content = content;
        comment.updatedAt = new Date();
        
        await comment.save();
        
        res.json({ success: true, message: 'Comment updated successfully', data: comment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get detailed event statistics
const getEventStats = async (req, res) => {
    try {
        const { id } = req.query;
        
        const event = await Event.findById(id)
            .populate('likes', 'name')
            .populate('views', 'name')
            .populate({
                path: 'comments',
                populate: { path: 'addedBy', select: 'name' }
            });
            
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        const stats = {
            basic: {
                likes: event.likes?.length || 0,
                views: event.views?.length || 0,
                comments: event.comments?.length || 0,
                shares: event.shares?.length || 0,
                attendees: event.attendees?.length || 0
            },
            engagement: {
                engagementRate: ((event.likes?.length || 0) + (event.comments?.length || 0)) / Math.max(event.views?.length || 1, 1) * 100,
                avgCommentsPerView: (event.comments?.length || 0) / Math.max(event.views?.length || 1, 1)
            },
            timeline: {
                createdAt: event.createdAt,
                lastActivity: Math.max(
                    new Date(event.createdAt).getTime(),
                    ...(event.likes?.map(like => new Date(like.createdAt || 0).getTime()) || [0]),
                    ...(event.comments?.map(comment => new Date(comment.createdAt || 0).getTime()) || [0])
                )
            }
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Report an event
const reportEvent = async (req, res) => {
    try {
        const { id } = req.query;
        const { reason } = req.body;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        // Add report to event
        if (!event.reports) event.reports = [];
        
        event.reports.push({
            user: req.user._id,
            reason,
            createdAt: new Date()
        });
        
        await event.save();
        
        res.json({ success: true, message: 'Event reported successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bookmark/unbookmark an event
const bookmarkEvent = async (req, res) => {
    try {
        const { id } = req.query;
        const userId = req.user._id;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        if (!event.bookmarks) event.bookmarks = [];
        
        const isBookmarked = event.bookmarks.includes(userId);
        
        if (isBookmarked) {
            // Remove bookmark
            event.bookmarks = event.bookmarks.filter(bookmark => !bookmark.equals(userId));
            await event.save();
            res.json({ success: true, message: 'Bookmark removed', bookmarked: false });
        } else {
            // Add bookmark
            event.bookmarks.push(userId);
            await event.save();
            res.json({ success: true, message: 'Event bookmarked', bookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's bookmarked events
const getBookmarkedEvents = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const events = await Event.find({
            bookmarks: userId,
            status: 'Published'
        }).populate('addedBy', 'name email');
        
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Share event (track shares)
const shareEvent = async (req, res) => {
    try {
        const { id } = req.query;
        const { platform } = req.body;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        if (!event.shares) event.shares = [];
        
        event.shares.push({
            user: req.user._id,
            platform,
            createdAt: new Date()
        });
        
        await event.save();
        
        // Generate share URL based on platform
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const eventUrl = `${baseUrl}/event/${id}`;
        
        let shareUrl;
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(event.title)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(`${event.title} - ${eventUrl}`)}`;
                break;
            default:
                shareUrl = eventUrl;
        }
        
        res.json({ success: true, shareUrl, message: 'Share tracked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addEvent,
    getMyEvents,
    delEvent,
    getEvent,
    updateEvent,
     searchEvents,
    getEventsByCategory,
    getEventCategories,
    getPopularEvents,
    getFeaturedEvents,
    getUpcomingEvents,
     addView,
    addLike,
    removeLike,
    addComment,
    getComments,
    deleteComment,
    updateComment,
     getEventStats,
    reportEvent,
    bookmarkEvent,
    getBookmarkedEvents,
    shareEvent
};