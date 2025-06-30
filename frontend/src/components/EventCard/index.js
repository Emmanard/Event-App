import React from 'react';
import { Link } from 'react-router-dom';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import seats from 'assets/pictures/seats.png';
import moment from 'moment';
import { addView } from 'services/event';
import './eventcard.scss';

const EventCard = ({ event, className = "" }) => {
    const handleCardClick = async () => {
        // Add view when user clicks on the card
        try {
            await addView(event?._id);
        } catch (error) {
            console.log('Error adding view:', error);
        }
    };

    const handleShareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Add your share functionality here
        if (navigator.share) {
            navigator.share({
                title: event?.title,
                text: `Check out this event: ${event?.title}`,
                url: `${window.location.origin}/event/${event?._id}`
            }).catch(console.error);
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(`${window.location.origin}/event/${event?._id}`)
                .then(() => {
                    if (window.toastify) {
                        window.toastify("Event link copied to clipboard!", "success");
                    }
                })
                .catch(console.error);
        }
    };

    return (
        <div className={`col d-flex align-items-stretch justify-content-center ${className}`}>
            <div className="card border-0 shadow rounded-4 w-100 overflow-hidden">
                <Link 
                    className="card-img text-decoration-none text-body" 
                    to={`/event/${event?._id}`}
                    onClick={handleCardClick}
                >
                    <img src={event?.image} className="card-img-top" alt={event?.title || "Event"} />
                    <div className="seats bg-info py-2 px-4 d-flex align-items-center">
                        <img src={seats} style={{ width: 30, marginRight: 10 }} alt="Seats" />
                        <span>{(event?.seats || 0) - (event?.seatsBooked?.length || 0)} Seats</span>
                    </div>
                </Link>
                <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between mb-3">
                        <div>
                            <i className='bx bx-calendar text-warning me-1'></i> 
                            <span>{moment(event?.date).format('MMM D, YYYY')}</span>
                        </div>
                        <div>
                            <LocationOnOutlinedIcon fontSize='small' className='text-warning me-1' />
                            <span>{event?.country}</span>
                        </div>
                    </div>
                    <h5 className="card-title">
                        <Link 
                            to={`/event/${event?._id}`} 
                            onClick={handleCardClick}
                            className="text-decoration-none"
                        >
                            {event?.title}
                        </Link>
                    </h5>
                    
                    {/* Optional: Show ticket price if available */}
                    {event?.ticketPrice && (
                        <div className="mb-2">
                            <span className="text-primary fw-bold">₦{event.ticketPrice}</span>
                        </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
                        <span>
                            <Link 
                                to={`/event/${event?._id}`} 
                                className='text-warning text-decoration-none'
                                onClick={handleCardClick}
                            >
                                Book Now
                            </Link>
                        </span>
                        <span>
                            <button 
                                className='btn btn-outline-info btn-sm'
                                onClick={handleShareClick}
                                title="Share event"
                            >
                                <ShareOutlinedIcon fontSize='small' />
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;