import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { 
    getEventsByCategory, 
    getAllEvents,
    getPopularEvents, 
    addLike, 
    addView,
   
} from '../../../services/event/index'

export default function Categories() {
    const { category } = useParams()
    const navigate = useNavigate()
    const [categoryEvents, setCategoryEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sortBy, setSortBy] = useState('popular')
    const [viewMode, setViewMode] = useState('grid')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalEvents, setTotalEvents] = useState(0)
    const [filters, setFilters] = useState({
        dateRange: 'all',
        priceRange: 'all',
        location: 'all'
    })

    // Enhanced category mapping with exact backend matches
    const categoryMapping = {
        'business': 'Business',
        'technology': 'Technology', 
        'entertainment': 'Entertainment',
        'sports': 'Sports',
        'education': 'Education',
        'health': 'Health',
        'arts': 'Arts',
        'music': 'Music',
        'food': 'Food',
        'networking': 'Networking',
        'concert': 'Concert',
        'workshop': 'Workshop',
        'conference': 'Conference',
        'seminar': 'Seminar',
        'meetup': 'Meetup',
        'charity': 'Charity',
        'outdoor': 'Outdoor',
        'travel': 'Travel',
        'fashion': 'Fashion',
        'lifestyle': 'Lifestyle'
    }

    useEffect(() => {
        window.scroll(0, 0);
        setCurrentPage(1) // Reset page when category changes
        fetchCategoryEvents(1) // Fetch from page 1
    }, [category])

    useEffect(() => {
        if (currentPage > 1) {
            fetchCategoryEvents(currentPage)
        }
    }, [currentPage])

    useEffect(() => {
        // Re-fetch when sorting changes
        setCurrentPage(1)
        fetchCategoryEvents(1)
    }, [sortBy])
    
    const fetchCategoryEvents = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)
            
            const mappedCategory = categoryMapping[category?.toLowerCase()] || 
                                 category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase()
            
            console.log('Fetching category:', mappedCategory, 'Page:', page)
            
            let response;
            let events = [];
            let pagination = {};

            // Try multiple API approaches for comprehensive results
            try {
                // Primary approach: Use getEventsByCategory for better filtering
                response = await getEventsByCategory(mappedCategory, {
                    page: page,
                    limit: 12,
                    sortBy: sortBy,
                    ...filters
                })
                
                console.log('getEventsByCategory response:', response)
                
                if (response.data && response.data.success) {
                    events = response.data.data || []
                    pagination = response.data.pagination || {}
                }
            } catch (categoryError) {
                console.log('getEventsByCategory failed, trying getAllEvents:', categoryError)
                
                // Fallback approach: Use getAllEvents with category filter
                response = await getAllEvents({
                    category: mappedCategory,
                    page: page,
                    limit: 12,
                    sortBy: sortBy
                })
                
                if (response.data && response.data.success) {
                    events = response.data.data || []
                    pagination = response.data.pagination || {}
                }
            }

            // If both fail, try getPopularEvents as last resort
            if (events.length === 0) {
                console.log('Trying getPopularEvents as fallback')
                response = await getPopularEvents(mappedCategory)
                
                if (response.data && response.data.success) {
                    events = response.data.data || []
                    // Since getPopularEvents doesn't have pagination, simulate it
                    const startIndex = (page - 1) * 12
                    const endIndex = startIndex + 12
                    const paginatedEvents = events.slice(startIndex, endIndex)
                    
                    events = paginatedEvents
                    pagination = {
                        page: page,
                        limit: 12,
                        total: response.data.data?.length || 0,
                        pages: Math.ceil((response.data.data?.length || 0) / 12)
                    }
                }
            }

            console.log('Final events:', events.length, 'Pagination:', pagination)

            // Apply client-side sorting if needed
            if (events.length > 0) {
                events = sortEventsLocally(events, sortBy)
            }

            // Update state
            if (page === 1) {
                setCategoryEvents(events)
            } else {
                // Append for "Load More" functionality
                setCategoryEvents(prev => [...prev, ...events])
            }
            
            setTotalPages(pagination.pages || 1)
            setTotalEvents(pagination.total || events.length)
            
        } catch (err) {
            console.error('Error fetching category events:', err)
            setError('Failed to load events. Please try again.')
            setCategoryEvents([])
        } finally {
            setLoading(false)
        }
    }

    const sortEventsLocally = (events, sortType) => {
        switch (sortType) {
            case 'newest':
                return [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            case 'oldest':
                return [...events].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            case 'date-asc':
                return [...events].sort((a, b) => new Date(a.date) - new Date(b.date))
            case 'date-desc':
                return [...events].sort((a, b) => new Date(b.date) - new Date(a.date))
            case 'price-low':
                return [...events].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
            case 'price-high':
                return [...events].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
            case 'alphabetical':
                return [...events].sort((a, b) => a.title.localeCompare(b.title))
            case 'popular':
            default:
                return [...events].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        }
    }

    const handleEventClick = async (eventId) => {
        try {
            await addView(eventId)
            navigate(`/event/${eventId}`)
        } catch (err) {
            console.error('Error tracking view:', err)
            navigate(`/event/${eventId}`)
        }
    }

    const handleLikeEvent = async (eventId, e) => {
        e.stopPropagation()
        try {
            await addLike(eventId)
            // Update the specific event in the list instead of refetching all
            setCategoryEvents(prev => 
                prev.map(event => 
                    event._id === eventId 
                        ? { ...event, likes: [...(event.likes || []), 'current-user'] }
                        : event
                )
            )
            toast.success('Event liked!')
        } catch (err) {
            console.error('Error liking event:', err)
            toast.error('Failed to like event')
        }
    }

    const handleBookEvent = (eventId, e) => {
        e.stopPropagation()
        // Placeholder for future booking functionality
        toast.info('Booking feature coming soon!')
        // In the future, this could navigate to a booking page or open a booking modal
        // navigate(`/book-event/${eventId}`)
    }

    const handleLoadMore = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1)
        }
    }

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }))
        setCurrentPage(1)
        fetchCategoryEvents(1)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCategoryName = (cat) => {
        return cat?.toUpperCase().replace(/-/g, ' ') || 'EVENTS'
    }

    const getEventStats = (event) => {
        return {
            likes: event.likes?.length || 0,
            views: event.views?.length || 0,
            comments: event.comments?.length || 0
        }
    }

    // Apply client-side filters for additional filtering
    const filteredEvents = categoryEvents.filter(event => {
        if (filters.dateRange !== 'all') {
            const eventDate = new Date(event.date)
            const now = new Date()
            
            switch (filters.dateRange) {
                case 'today':
                    if (eventDate.toDateString() !== now.toDateString()) return false
                    break
                case 'tomorrow':
                    const tomorrow = new Date(now)
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    if (eventDate.toDateString() !== tomorrow.toDateString()) return false
                    break
                case 'this-week':
                    const weekStart = new Date(now)
                    weekStart.setDate(now.getDate() - now.getDay())
                    const weekEnd = new Date(weekStart)
                    weekEnd.setDate(weekStart.getDate() + 7)
                    if (eventDate < weekStart || eventDate > weekEnd) return false
                    break
                case 'this-month':
                    if (eventDate.getMonth() !== now.getMonth() || 
                        eventDate.getFullYear() !== now.getFullYear()) return false
                    break
                    default:
                        break
            }
        }
        
        if (filters.priceRange !== 'all') {
            const price = parseFloat(event.price || 0)
            
            switch (filters.priceRange) {
                case 'free':
                    if (price > 0) return false
                    break
                case '0-25':
                    if (price > 25) return false
                    break
                case '25-50':
                    if (price < 25 || price > 50) return false
                    break
                case '50-100':
                    if (price < 50 || price > 100) return false
                    break
                case '100+':
                    if (price < 100) return false
                    break
                     default:
                        break
            }
        }
        
        if (filters.location !== 'all') {
            if (!event.location || 
                !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
                return false
            }
        }
        
        return true
    })

    return (
        <>
            <Navbar />
            
            <section id="categories-section">
                <div className="container">
                    {/* Header Section */}
                    <div className="row">
                        <div className="col">
                            <h5 className="category-subtitle">Category</h5>
                            <h2 className="category-title">{formatCategoryName(category)}</h2>
                            {totalEvents > 0 && (
                                <p className="category-count">
                                    {totalEvents} {totalEvents === 1 ? 'event' : 'events'} found
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="row controls-section">
                        <div className="col-md-4">
                            <div className="control-group">
                                <label htmlFor="sortBy" className="control-label">Sort by:</label>
                                <select 
                                    id="sortBy"
                                    className="form-select control-select" 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="popular">Most Popular</option>
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="date-asc">Event Date (Soon)</option>
                                    <option value="date-desc">Event Date (Latest)</option>
                                    <option value="price-low">Price (Low to High)</option>
                                    <option value="price-high">Price (High to Low)</option>
                                    <option value="alphabetical">Alphabetical</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Additional Filters */}
                        <div className="col-md-4">
                            <div className="control-group">
                                <label htmlFor="dateFilter" className="control-label">Date:</label>
                                <select 
                                    id="dateFilter"
                                    className="form-select control-select" 
                                    value={filters.dateRange} 
                                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                >
                                    <option value="all">All Dates</option>
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="this-week">This Week</option>
                                    <option value="this-month">This Month</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Price Filter */}
                        <div className="col-md-2">
                            <div className="control-group">
                                <label htmlFor="priceFilter" className="control-label">Price:</label>
                                <select 
                                    id="priceFilter"
                                    className="form-select control-select" 
                                    value={filters.priceRange} 
                                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                >
                                    <option value="all">All Prices</option>
                                    <option value="free">Free</option>
                                    <option value="0-25">$0 - $25</option>
                                    <option value="25-50">$25 - $50</option>
                                    <option value="50-100">$50 - $100</option>
                                    <option value="100+">$100+</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="col-md-2">
                            <div className="view-controls">
                                <button 
                                    className={`btn view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                >
                                    <i className="fas fa-th"></i>
                                </button>
                                <button 
                                    className={`btn view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >
                                    <i className="fas fa-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && currentPage === 1 && (
                        <div className="row">
                            <div className="col">
                                <div className="loading-state">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="loading-text">Loading {formatCategoryName(category).toLowerCase()}...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="row">
                            <div className="col">
                                <div className="error-state">
                                    <div className="error-content">
                                        <i className="fas fa-exclamation-triangle error-icon"></i>
                                        <h5>Oops! Something went wrong</h5>
                                        <p>{error}</p>
                                        <button 
                                            className="btn btn-warning retry-btn"
                                            onClick={() => fetchCategoryEvents(1)}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredEvents.length === 0 && (
                        <div className="row">
                            <div className="col">
                                <div className="empty-state">
                                    <i className="fas fa-calendar-times empty-icon"></i>
                                    <h4>No events found</h4>
                                    <p className="empty-description">
                                        No {formatCategoryName(category).toLowerCase()} match your criteria.
                                        <br />
                                        Try adjusting your filters or be the first to create an event in this category!
                                    </p>
                                    <button 
                                        className="btn btn-warning create-event-btn"
                                        onClick={() => navigate('/create-event')}
                                    >
                                        Create Event
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Events Grid */}
            {!loading && !error && filteredEvents.length > 0 && (
                <section id="categories-events-grid">
                    <div className="container">
                        <div className={`row events-container ${viewMode}-view`}>
                            {filteredEvents.map((event) => {
                                const stats = getEventStats(event)
                                
                                return (
                                    <div 
                                        key={event._id} 
                                        className={viewMode === 'grid' ? 'col-md-6 col-lg-4 event-col' : 'col-12 event-col'}
                                    >
                                        <div 
                                            className={`card event-card ${viewMode === 'list' ? 'list-card' : 'grid-card'}`}
                                            onClick={() => handleEventClick(event._id)}
                                        >
                                            {event.image && (
                                                <div className="card-image-container">
                                                    <img 
                                                        src={event.image} 
                                                        className="card-img-top event-image" 
                                                        alt={event.title}
                                                        onError={(e) => {
                                                            e.target.src = '/default-event-image.jpg'
                                                        }}
                                                    />
                                                    <div className="image-overlay">
                                                        <span className="category-badge">{event.category}</span>
                                                        <div className="card-actions">
                                                            <button
                                                                className="btn action-btn like-btn"
                                                                onClick={(e) => handleLikeEvent(event._id, e)}
                                                                title="Like this event"
                                                            >
                                                                <i className="fas fa-heart"></i>
                                                                <span className="action-count">{stats.likes}</span>
                                                            </button>
                                                            <button
                                                                className="btn action-btn view-btn"
                                                                title="Views"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                                <span className="action-count">{stats.views}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="card-body">
                                                <div className="card-header-row">
                                                    <h5 className="card-title">{event.title}</h5>
                                                    <div className="price-tag">
                                                        {event.price && event.price > 0 ? (
                                                            <span className="price-paid">${event.price}</span>
                                                        ) : (
                                                            <span className="price-free">FREE</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <p className="card-text event-description">
                                                    {event.description?.substring(0, 120)}
                                                    {event.description?.length > 120 && '...'}
                                                </p>
                                                
                                                <div className="event-meta">
                                                    <div className="meta-item">
                                                        <i className="fas fa-calendar"></i>
                                                        <span>{formatDate(event.date)}</span>
                                                    </div>
                                                    {event.location && (
                                                        <div className="meta-item">
                                                            <i className="fas fa-map-marker-alt"></i>
                                                            <span>{event.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="card-footer-actions">
                                                    <div className="stats-group">
                                                        <span className="stat-item">
                                                            <i className="fas fa-comments"></i>
                                                            {stats.comments}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="btn btn-warning book-now-btn"
                                                        onClick={(e) => handleBookEvent(event._id, e)}
                                                    >
                                                        <i className="fas fa-ticket-alt"></i>
                                                        Book Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Load More Button */}
                        {currentPage < totalPages && (
                            <div className="row load-more-section">
                                <div className="col">
                                    <div className="load-more-container">
                                        <button 
                                            className="btn btn-outline-warning load-more-btn"
                                            onClick={handleLoadMore}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                                    Loading...
                                                </>
                                            ) : (
                                                'Load More Events'
                                            )}
                                        </button>
                                        <p className="pagination-info">
                                            Showing {filteredEvents.length} of {totalEvents} events
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <Footer />
        </>
    )
}