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

// Get all events with pagination and filtering
const getAllEvents = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10,
            sortBy = 'newest',
            status = 'Published',
            dateFrom,
            dateTo,
            category,
            location
        } = req.query;
        
        // Build query object
        let query = { status };
        
        // Add date filter for upcoming events only (optional)
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = new Date(dateFrom);
            if (dateTo) query.date.$lte = new Date(dateTo);
        }
        
        // Category filter
        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
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
            case 'date-asc':
                sort = { date: 1 };
                break;
            case 'date-desc':
                sort = { date: -1 };
                break;
            case 'popular':
                sort = { likes: -1, views: -1, createdAt: -1 };
                break;
            case 'most-viewed':
                sort = { views: -1, createdAt: -1 };
                break;
            case 'most-liked':
                sort = { likes: -1, createdAt: -1 };
                break;
            default:
                sort = { createdAt: -1 };
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
        console.error('getAllEvents Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get popular events across all categories
const getPopularEventsAll = async (req, res) => {
    try {
        const { limit = 10, timeframe = 'all' } = req.query;
        
        // Build date filter based on timeframe
        let dateFilter = { status: 'Published' };
        
        switch (timeframe) {
            case 'week':
                dateFilter.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
                break;
            case 'month':
                dateFilter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
                break;
            case 'year':
                dateFilter.createdAt = { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) };
                break;
            case 'upcoming':
                dateFilter.date = { $gte: new Date() };
                break;
            default:
                // 'all' - no additional date filter
                break;
        }
        
        // Use aggregation to calculate popularity score
        const events = await Event.aggregate([
            { $match: dateFilter },
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    viewsCount: { $size: { $ifNull: ["$views", []] } },
                    commentsCount: { $size: { $ifNull: ["$comments", []] } },
                    bookmarksCount: { $size: { $ifNull: ["$bookmarks", []] } },
                    sharesCount: { $size: { $ifNull: ["$shares", []] } }
                }
            },
            {
                $addFields: {
                    // Calculate popularity score: likes * 3 + views * 1 + comments * 2 + bookmarks * 2 + shares * 4
                    popularityScore: {
                        $add: [
                            { $multiply: ["$likesCount", 3] },
                            { $multiply: ["$viewsCount", 1] },
                            { $multiply: ["$commentsCount", 2] },
                            { $multiply: ["$bookmarksCount", 2] },
                            { $multiply: ["$sharesCount", 4] }
                        ]
                    }
                }
            },
            { $sort: { popularityScore: -1, createdAt: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'addedBy',
                    foreignField: '_id',
                    as: 'addedBy',
                    pipeline: [{ $project: { name: 1, email: 1 } }]
                }
            },
            {
                $addFields: {
                    addedBy: { $arrayElemAt: ["$addedBy", 0] }
                }
            }
        ]);
        
        res.json({
            success: true,
            data: events,
            message: events.length === 0 ? 'No popular events found' : undefined
        });
        
    } catch (error) {
        console.error('Error in getPopularEventsAll:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Alternative simpler version of popular events (similar to your existing function)
const getPopularEventsSimple = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const events = await Event.aggregate([
            { $match: { status: "Published" } },
            { 
                $addFields: { 
                    viewsLength: { $size: { $ifNull: ["$views", []] } },
                    likesLength: { $size: { $ifNull: ["$likes", []] } }
                } 
            },
            { 
                $sort: { 
                    likesLength: -1, 
                    viewsLength: -1, 
                    createdAt: -1 
                } 
            },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'addedBy',
                    foreignField: '_id',
                    as: 'addedBy',
                    pipeline: [{ $project: { name: 1, email: 1 } }]
                }
            },
            {
                $addFields: {
                    addedBy: { $arrayElemAt: ["$addedBy", 0] }
                }
            }
        ]);
        
        res.json({
            success: true,
            data: events,
            message: events.length === 0 ? 'No popular events found' : undefined
        });
        
    } catch (error) {
        console.error('Error in getPopularEventsSimple:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

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
        
        // Use case-insensitive regex instead of converting to lowercase
        let query = { 
            category: { $regex: new RegExp(`^${category}$`, 'i') }, // Case-insensitive exact match
            status: 'Published',
            date: { $gte: new Date() }
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
            case 'date-asc':
                sort = { date: 1 };
                break;
            case 'date-desc':
                sort = { date: -1 };
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
        console.error('getEventsByCategory Error:', error);
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
            return res.status(200).json({ 
                success: true, 
                data: comments, 
                count: commentsCount.length 
            });
        } else {
            console.log("No comments found for event ID:", id);
            return res.status(200).json({ 
                success: true, 
                data: [], 
                count: 0,
                message: "No comments found" 
            });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error. Please try again later." 
        });
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
const bookEvent = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user?._id;
        
        // Validate user authentication
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }
        
        // Validate ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid event ID format' 
            });
        }
        
        // Extract booking data from request body
        const { 
            fullName, 
            email, 
            phone, 
            quantity = 1 // Default to 1 if not provided
        } = req.body;
        
        console.log('Booking event:', { 
            eventId: id, 
            userId, 
            quantity, 
            fullName, 
            email, 
            phone 
        });
        
        // Validate quantity
        const bookingQuantity = parseInt(quantity);
        if (isNaN(bookingQuantity) || bookingQuantity < 1 || bookingQuantity > 10) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quantity must be a valid number between 1 and 10' 
            });
        }
        
        // Find event with error handling
        let event;
        try {
            event = await Event.findById(id);
        } catch (dbError) {
            console.error('Database error finding event:', dbError);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error occurred' 
            });
        }
        
        if (!event) {
            console.log('Event not found:', id);
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        console.log('Event found:', { 
            title: event.title, 
            status: event.status,
            seats: event.seats,
            currentBookings: event.seatsBooked?.length || 0
        });
        
        // Check if event is published
        if (event.status !== 'Published') {
            console.log('Event not published:', event.status);
            return res.status(400).json({ 
                success: false, 
                message: 'Event is not available for booking' 
            });
        }
        
        // Check if event date has passed
        if (event.date && new Date(event.date) < new Date()) {
            console.log('Event date has passed:', event.date);
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot book past events' 
            });
        }
        
        // Validate event has seats property
        if (!event.seats || event.seats <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Event has no available seats' 
            });
        }
        
        // Initialize seatsBooked if it doesn't exist
        if (!event.seatsBooked) {
            event.seatsBooked = [];
        }
        
        // FIXED: Check if user already booked this event (handle both legacy and new format)
        const userBookingCount = event.seatsBooked.filter(booking => {
            // Handle legacy format (just ObjectId/string)
            if (typeof booking === 'string' || (mongoose.Types.ObjectId.isValid(booking) && !booking.userId)) {
                return booking.toString() === userId.toString();
            }
            // Handle new format (object with userId)
            if (booking && typeof booking === 'object' && booking.userId) {
                return booking.userId.toString() === userId.toString();
            }
            return false;
        }).length;
        
        if (userBookingCount > 0) {
            console.log('User already booked:', userId);
            return res.status(400).json({ 
                success: false, 
                message: 'You have already booked this event' 
            });
        }
        
        // Check if enough seats are available
        const availableSeats = event.seats - event.seatsBooked.length;
        if (availableSeats < bookingQuantity) {
            console.log('Not enough seats available:', { 
                requested: bookingQuantity, 
                available: availableSeats 
            });
            return res.status(400).json({ 
                success: false, 
                message: `Only ${availableSeats} seats available, but you requested ${bookingQuantity}` 
            });
        }
        
        // Create booking entries with validation
        const bookingEntries = [];
        for (let i = 0; i < bookingQuantity; i++) {
            const bookingEntry = {
                userId: userId,
                fullName: fullName || req.user?.fullName || req.user?.name || 'Unknown',
                email: email || req.user?.email || '',
                phone: phone || req.user?.phone || '',
                bookingDate: new Date(),
                seatNumber: event.seatsBooked.length + i + 1 // Sequential seat numbering
            };
            
            // Validate required fields
            if (!bookingEntry.email) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email is required for booking' 
                });
            }
            
            bookingEntries.push(bookingEntry);
        }
        
        // Add bookings to event and save with error handling
        event.seatsBooked.push(...bookingEntries);
        
        try {
            await event.save();
        } catch (saveError) {
            console.error('Error saving event booking:', saveError);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to save booking. Please try again.' 
            });
        }
        
        console.log('Booking successful:', { 
            eventId: id, 
            userId, 
            quantity: bookingQuantity,
            newBookedCount: event.seatsBooked.length 
        });
        
        res.json({ 
            success: true, 
            msg: `Successfully booked ${bookingQuantity} seat(s)!`,
            data: {
                eventId: event._id,
                eventTitle: event.title,
                bookingQuantity: bookingQuantity,
                seatNumbers: bookingEntries.map(entry => entry.seatNumber),
                bookedSeats: event.seatsBooked.length,
                availableSeats: event.seats - event.seatsBooked.length,
                bookingDetails: bookingEntries
            }
        });
        
    } catch (error) {
        console.error('Book event error:', error);
        
        // More specific error handling
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error: ' + error.message 
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid data format provided' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// FIXED: Legacy single booking API (for backward compatibility)
const bookEventSingle = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id;
        
        console.log('Single booking event:', { eventId: id, userId });
        
        const event = await Event.findById(id);
        if (!event) {
            console.log('Event not found:', id);
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        console.log('Event found:', { 
            title: event.title, 
            status: event.status 
        });
        
        // Check if event is published
        if (event.status !== 'Published') {
            console.log('Event not published:', event.status);
            return res.status(400).json({ 
                success: false, 
                message: 'Event is not available for booking' 
            });
        }
        
        // Check if event date has passed
        if (new Date(event.date) < new Date()) {
            console.log('Event date has passed:', event.date);
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot book past events' 
            });
        }
        
        // Initialize seatsBooked if it doesn't exist
        if (!event.seatsBooked) {
            event.seatsBooked = [];
        }
        
        // FIXED: Check for both legacy and new format bookings
        const hasExistingBooking = event.seatsBooked.some(booking => {
            // Check legacy format (string/ObjectId)
            if (typeof booking === 'string' || (mongoose.Types.ObjectId.isValid(booking) && !booking.userId)) {
                return booking.toString() === userId.toString();
            }
            // Check new format (object with userId)
            if (booking && typeof booking === 'object' && booking.userId) {
                return booking.userId.toString() === userId.toString();
            }
            return false;
        });
        
        if (hasExistingBooking) {
            console.log('User already booked:', userId);
            return res.status(400).json({ 
                success: false, 
                message: 'You have already booked this event' 
            });
        }
        
        // Check if seats are available
        if (event.seatsBooked.length >= event.seats) {
            console.log('Event fully booked:', { 
                booked: event.seatsBooked.length, 
                total: event.seats 
            });
            return res.status(400).json({ 
                success: false, 
                message: 'Event is fully booked' 
            });
        }
        
        // UPDATED: Add user to booked seats using new object format for consistency
        const bookingEntry = {
            userId: userId,
            fullName: req.user?.fullName || req.user?.name || 'Unknown',
            email: req.user?.email || '',
            phone: req.user?.phone || '',
            bookingDate: new Date(),
            seatNumber: event.seatsBooked.length + 1
        };
        
        event.seatsBooked.push(bookingEntry);
        await event.save();
        
        console.log('Single booking successful:', { 
            eventId: id, 
            userId, 
            newBookedCount: event.seatsBooked.length 
        });
        
        res.json({ 
            success: true, 
            msg: 'Event booked successfully!',
            data: {
                eventId: event._id,
                eventTitle: event.title,
                bookedSeats: event.seatsBooked.length,
                availableSeats: event.seats - event.seatsBooked.length
            }
        });
        
    } catch (error) {
        console.error('Single book event error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// FIXED: Cancel event booking (enhanced to handle both formats)
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id;
        
        console.log('Cancel booking request:', { eventId: id, userId: userId.toString() });
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        console.log('Event found, current seatsBooked:', event.seatsBooked);
        
        // Initialize seatsBooked if it doesn't exist
        if (!event.seatsBooked) {
            event.seatsBooked = [];
        }
        
        // FIXED: Find all bookings for this user (both formats)
        const bookingsToRemove = [];
        
        event.seatsBooked.forEach((booking, index) => {
            let isUserBooking = false;
            
            // Check if it's a legacy booking (string/ObjectId format)
            if (typeof booking === 'string' || (mongoose.Types.ObjectId.isValid(booking) && !booking.userId)) {
                if (booking.toString() === userId.toString()) {
                    isUserBooking = true;
                    console.log('Found legacy booking at index:', index);
                }
            }
            // Check if it's a new format booking (object with userId)
            else if (booking && typeof booking === 'object' && booking.userId) {
                if (booking.userId.toString() === userId.toString()) {
                    isUserBooking = true;
                    console.log('Found new format booking at index:', index);
                }
            }
            
            if (isUserBooking) {
                bookingsToRemove.push(index);
            }
        });
        
        console.log('Bookings to remove at indices:', bookingsToRemove);
        
        if (bookingsToRemove.length === 0) {
            console.log('No bookings found for user');
            return res.status(400).json({ 
                success: false, 
                message: 'You have not booked this event' 
            });
        }
        
        // Remove bookings in reverse order to maintain correct indices
        bookingsToRemove.reverse().forEach(index => {
            console.log('Removing booking at index:', index);
            event.seatsBooked.splice(index, 1);
        });
        
        console.log('Bookings after removal:', event.seatsBooked);
        
        try {
            await event.save();
            console.log('Event saved successfully');
        } catch (saveError) {
            console.error('Error saving event after cancellation:', saveError);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to cancel booking. Please try again.' 
            });
        }
        
        const cancelledCount = bookingsToRemove.length;
        
        res.json({ 
            success: true, 
            message: `Successfully cancelled ${cancelledCount} booking(s)!`,
            data: {
                eventId: event._id,
                eventTitle: event.title,
                cancelledBookings: cancelledCount,
                bookedSeats: event.seatsBooked.length,
                availableSeats: event.seats - event.seatsBooked.length
            }
        });
        
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// FIXED: Get user's booked events (enhanced to handle both formats)
const getMyBookedEvents = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, filter = 'all' } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        // Apply date filter based on request
        switch (filter) {
            case 'upcoming':
                dateFilter = { date: { $gte: now } };
                break;
            case 'past':
                dateFilter = { date: { $lt: now } };
                break;
            case 'today':
                const todayStart = new Date(now.setHours(0, 0, 0, 0));
                const todayEnd = new Date(now.setHours(23, 59, 59, 999));
                dateFilter = { date: { $gte: todayStart, $lte: todayEnd } };
                break;
            default:
                // 'all' - no date filter
                break;
        }
        
        const skip = (page - 1) * limit;
        
        // FIXED: Find events where user has booked (both legacy and new format)
        const events = await Event.find({
            $or: [
                { seatsBooked: userId }, // Legacy format (still works for string IDs)
                { 'seatsBooked.userId': userId } // New format (object with userId)
            ],
            status: 'Published',
            ...dateFilter
        })
        .populate('addedBy', 'name email fullName')
        .sort({ date: 1 }) // Sort by date ascending (nearest first)
        .skip(skip)
        .limit(parseInt(limit));
        
        // Add booking details for each event
        const eventsWithBookingDetails = events.map(event => {
            const eventObj = event.toObject();
            
            // FIXED: Find user's bookings in this event
            const userBookings = event.seatsBooked.filter(booking => {
                // Check legacy format
                if (typeof booking === 'string' || (mongoose.Types.ObjectId.isValid(booking) && !booking.userId)) {
                    return booking.toString() === userId.toString();
                }
                // Check new format
                if (booking && typeof booking === 'object' && booking.userId) {
                    return booking.userId.toString() === userId.toString();
                }
                return false;
            });
            
            eventObj.userBookingDetails = userBookings;
            eventObj.userBookingCount = userBookings.length;
            
            return eventObj;
        });
        
        const total = await Event.countDocuments({
            $or: [
                { seatsBooked: userId },
                { 'seatsBooked.userId': userId }
            ],
            status: 'Published',
            ...dateFilter
        });
        
        res.json({
            success: true,
            data: eventsWithBookingDetails,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get booked events error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// FIXED: Check if user has booked an event (enhanced to handle both formats)
const checkBookingStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id;
        
        console.log('Check booking status:', { eventId: id, userId: userId.toString() });
        
        const event = await Event.findById(id).select('seatsBooked seats');
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        // Initialize seatsBooked if it doesn't exist
        if (!event.seatsBooked) {
            event.seatsBooked = [];
        }
        
        console.log('Event seatsBooked length:', event.seatsBooked.length);
        console.log('First booking sample:', event.seatsBooked[0]);
        
        // FIXED: Count user bookings in both formats
        let userBookingCount = 0;
        const userBookingDetails = [];
        
        event.seatsBooked.forEach((booking, index) => {
            let isUserBooking = false;
            
            // Check legacy format (string/ObjectId)
            if (typeof booking === 'string' || (mongoose.Types.ObjectId.isValid(booking) && !booking.userId)) {
                if (booking.toString() === userId.toString()) {
                    isUserBooking = true;
                    userBookingDetails.push({
                        type: 'legacy',
                        index: index,
                        userId: booking
                    });
                    console.log('Found legacy booking match at index:', index);
                }
            }
            // Check new format (object with userId)
            else if (booking && typeof booking === 'object' && booking.userId) {
                console.log('Comparing userIds:', {
                    bookingUserId: booking.userId.toString(),
                    currentUserId: userId.toString(),
                    match: booking.userId.toString() === userId.toString()
                });
                
                if (booking.userId.toString() === userId.toString()) {
                    isUserBooking = true;
                    userBookingDetails.push({
                        type: 'detailed',
                        index: index,
                        ...booking.toObject ? booking.toObject() : booking
                    });
                    console.log('Found detailed booking match at index:', index);
                }
            }
            
            if (isUserBooking) {
                userBookingCount++;
            }
        });
        
        const isBooked = userBookingCount > 0;
        const availableSeats = event.seats - event.seatsBooked.length;
        
        console.log('Final booking status result:', {
            isBooked,
            userBookingCount,
            availableSeats,
            totalBookings: event.seatsBooked.length,
            userBookingDetails
        });
        
        res.json({
            success: true,
            data: {
                isBooked,
                userBookingCount,
                availableSeats,
                totalSeats: event.seats,
                bookedSeats: event.seatsBooked.length,
                canBook: !isBooked && availableSeats > 0,
                bookingDetails: userBookingDetails
            }
        });
        
    } catch (error) {
        console.error('Check booking status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// FIXED: Get event attendees (enhanced to handle both formats)
const getEventAttendees = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id;
        
        const event = await Event.findById(id)
            .populate('addedBy', '_id');
        
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        // Check if user is the event organizer
        if (!event.addedBy._id.equals(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Only event organizer can view attendees.' 
            });
        }
        
        // FIXED: Separate legacy and new format bookings
        const legacyBookings = [];
        const detailedBookings = [];
        
        for (const booking of event.seatsBooked) {
            // Check for legacy format (string/ObjectId)
            if (typeof booking === 'string' || (mongoose.Types.ObjectId.isValid(booking) && !booking.userId)) {
                // Legacy booking - fetch user details
                try {
                    const user = await User.findById(booking).select('name email fullName phone');
                    if (user) {
                        legacyBookings.push({
                            userId: booking,
                            fullName: user.fullName || user.name,
                            email: user.email,
                            phone: user.phone,
                            bookingType: 'legacy'
                        });
                    }
                } catch (err) {
                    console.log('Could not fetch user details for legacy booking:', booking);
                }
            } 
            // Check for new format (object with userId)
            else if (booking && typeof booking === 'object' && booking.userId) {
                detailedBookings.push({
                    ...booking.toObject ? booking.toObject() : booking,
                    bookingType: 'detailed'
                });
            }
        }
        
        const allAttendees = [...legacyBookings, ...detailedBookings];
        
        res.json({
            success: true,
            data: {
                attendees: allAttendees,
                totalAttendees: event.seatsBooked.length,
                legacyBookings: legacyBookings.length,
                detailedBookings: detailedBookings.length,
                availableSeats: event.seats - event.seatsBooked.length,
                totalSeats: event.seats
            }
        });
        
    } catch (error) {
        console.error('Get attendees error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
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
    shareEvent,
        getAllEvents,
    getPopularEventsAll,
    getPopularEventsSimple,
     bookEvent,           // Enhanced booking with form data and quantity support
    bookEventSingle,     // Legacy single booking for backward compatibility
    cancelBooking,       // Enhanced cancellation
    getMyBookedEvents,   // Enhanced to show booking details
    checkBookingStatus,  // Enhanced status check
    getEventAttendees 
};