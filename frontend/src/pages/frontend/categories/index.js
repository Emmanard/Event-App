import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { getPopularEvents, addLike, addView } from '../../../services/event/index'

export default function Categories() {
    const { category } = useParams()
    const navigate = useNavigate()
    const [categoryEvents, setCategoryEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sortBy, setSortBy] = useState('popular')
    const [viewMode, setViewMode] = useState('grid')
    const [filters, setFilters] = useState({
        dateRange: 'all',
        priceRange: 'all',
        location: 'all'
    })

    // Map category URL params to event types
    const categoryMapping = {
        'business': 'business',
        'technology': 'technology',
        'entertainment': 'entertainment',
        'sports': 'sports',
        'education': 'education',
        'health': 'health',
        'arts': 'arts',
        'music': 'music',
        'food': 'food',
        'networking': 'networking'
    }

    useEffect(() => {
        window.scroll(0, 0);
        fetchCategoryEvents()
    }, [category, sortBy])

    const fetchCategoryEvents = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const mappedCategory = categoryMapping[category?.toLowerCase()] || category
            const response = await getPopularEvents(mappedCategory)
            
            if (response.success) {
                let events = response.data || []
                
                // Apply sorting
                events = sortEvents(events, sortBy)
                
                setCategoryEvents(events)
            } else {
                setError('Failed to fetch events')
                setCategoryEvents([])
            }
        } catch (err) {
            console.error('Error fetching category events:', err)
            setError('Failed to load events. Please try again.')
            setCategoryEvents([])
        } finally {
            setLoading(false)
        }
    }

    const sortEvents = (events, sortType) => {
        switch (sortType) {
            case 'newest':
                return [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            case 'oldest':
                return [...events].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            case 'date':
                return [...events].sort((a, b) => new Date(a.date) - new Date(b.date))
            case 'popular':
            default:
                return [...events].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        }
    }

    const handleEventClick = async (eventId) => {
        try {
            // Track view
            await addView(eventId)
            navigate(`/event/${eventId}`)
        } catch (err) {
            console.error('Error tracking view:', err)
            // Navigate anyway
            navigate(`/event/${eventId}`)
        }
    }

    const handleLikeEvent = async (eventId, e) => {
        e.stopPropagation()
        try {
            await addLike(eventId)
            // Refresh events to show updated like count
            fetchCategoryEvents()
            toast.success('Event liked!')
        } catch (err) {
            console.error('Error liking event:', err)
            toast.error('Failed to like event')
        }
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

    const filteredEvents = categoryEvents.filter(event => {
        // Apply filters here based on filters state
        if (filters.dateRange !== 'all') {
            // Implement date filtering logic
        }
        if (filters.priceRange !== 'all') {
            // Implement price filtering logic
        }
        if (filters.location !== 'all') {
            // Implement location filtering logic
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
                            <h5 className='text-center text-warning'>Category</h5>
                            <h2 className='text-center'>{formatCategoryName(category)}</h2>
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center gap-3">
                                <label htmlFor="sortBy" className="form-label mb-0">Sort by:</label>
                                <select 
                                    id="sortBy"
                                    className="form-select" 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ width: 'auto' }}
                                >
                                    <option value="popular">Most Popular</option>
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="date">Event Date</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex justify-content-end align-items-center gap-2">
                                <button 
                                    className={`btn ${viewMode === 'grid' ? 'btn-warning' : 'btn-outline-warning'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <i className="fas fa-th"></i>
                                </button>
                                <button 
                                    className={`btn ${viewMode === 'list' ? 'btn-warning' : 'btn-outline-warning'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <i className="fas fa-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="row">
                            <div className="col">
                                <div className="category-loading">
                                    <p>Loading {formatCategoryName(category).toLowerCase()}...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="row">
                            <div className="col">
                                <div className="alert alert-danger text-center">
                                    <h5>Oops! Something went wrong</h5>
                                    <p>{error}</p>
                                    <button 
                                        className="btn btn-warning"
                                        onClick={fetchCategoryEvents}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredEvents.length === 0 && (
                        <div className="row">
                            <div className="col">
                                <p className="text-center">
                                    No {formatCategoryName(category).toLowerCase()} found. 
                                    <br />
                                    <small className="text-muted">
                                        Be the first to create an event in this category!
                                    </small>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Events Grid */}
            {!loading && !error && filteredEvents.length > 0 && (
                <section id="categories-events-grid" className="pb-5">
                    <div className="container">
                        <div className="row mb-3">
                            <div className="col">
                                <p className="text-muted">
                                    Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="row">
                            {filteredEvents.map((event) => {
                                const stats = getEventStats(event)
                                
                                return (
                                    <div 
                                        key={event._id} 
                                        className={viewMode === 'grid' ? 'col-md-6 col-lg-4' : 'col-12'}
                                    >
                                        <div 
                                            className="card"
                                            onClick={() => handleEventClick(event._id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {event.image && (
                                                <img 
                                                    src={event.image} 
                                                    className="card-img-top" 
                                                    alt={event.title}
                                                    onError={(e) => {
                                                        e.target.src = '/default-event-image.jpg'
                                                    }}
                                                />
                                            )}
                                            
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 className="card-title">{event.title}</h5>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={(e) => handleLikeEvent(event._id, e)}
                                                        title="Like this event"
                                                    >
                                                        <i className="fas fa-heart"></i> {stats.likes}
                                                    </button>
                                                </div>
                                                
                                                <p className="card-text">
                                                    {event.description?.substring(0, 120)}
                                                    {event.description?.length > 120 && '...'}
                                                </p>
                                                
                                                <div className="text-muted mb-2">
                                                    <small>
                                                        <i className="fas fa-calendar me-2"></i>
                                                        {formatDate(event.date)}
                                                    </small>
                                                    <br />
                                                    {event.location && (
                                                        <small>
                                                            <i className="fas fa-map-marker-alt me-2"></i>
                                                            {event.location}
                                                        </small>
                                                    )}
                                                </div>

                                                {/* Event Stats */}
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        <i className="fas fa-eye me-1"></i>{stats.views} views
                                                    </small>
                                                    <small className="text-muted">
                                                        <i className="fas fa-comments me-1"></i>{stats.comments} comments
                                                    </small>
                                                    {event.price && (
                                                        <small className="text-success fw-bold">
                                                            ${event.price}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Load More Button (if you implement pagination) */}
                        {filteredEvents.length >= 10 && (
                            <div className="row mt-4">
                                <div className="col text-center">
                                    <button 
                                        className="btn btn-outline-warning btn-lg"
                                        onClick={() => {
                                            // Implement load more functionality
                                            toast.info('Load more functionality coming soon!')
                                        }}
                                    >
                                        Load More Events
                                    </button>
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