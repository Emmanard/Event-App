import React, { useEffect, useState } from 'react'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { getPopularEvents } from '../../../services/event/index'
import './upcomingEvent.scss'

export default function Upcoming() {
    const [upcomingEvents, setUpcomingEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        window.scroll(0, 0);
        fetchUpcomingEvents()
    }, [])

    const fetchUpcomingEvents = async () => {
        try {
            const response = await getPopularEvents('upcoming')
            setUpcomingEvents(response.data || [])
        } catch (error) {
            console.error('Error fetching upcoming events:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <div id="upcoming-events-section" style={{ paddingTop: '120px', minHeight: '70vh' }}>
                <div className="container">
                    <div className="row mb-5">
                        <div className="col">
                            <h5 className='text-center text-warning'>Events</h5>
                            <h2 className='heading-stylling display-5'>UPCOMING EVENTS</h2>
                        </div>
                    </div>
                    <div className="row">
                        {loading ? (
                            <div className="col text-center">
                                <p className="loading-state">Loading upcoming events</p>
                            </div>
                        ) : upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event, index) => (
                                <div key={index} className="col-md-6 col-lg-4 mb-4">
                                    <div className="card">
                                        <img src={event.image} className="card-img-top" alt={event.title} style={{height: '200px', objectFit: 'cover'}} />
                                        <div className="card-body">
                                            <h5 className="card-title">{event.title}</h5>
                                            <p className="card-text">{event.description}</p>
                                            <p className="text-muted">
                                                <small>Date: {new Date(event.startDate).toLocaleDateString()}</small>
                                            </p>
                                            <a href={`/event/details/${event._id}`} className="button-stylling-1">
                                                View Details
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col text-center">
                                <p>No upcoming events found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}