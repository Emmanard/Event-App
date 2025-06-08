import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from 'components/Navbar';
import Footer from 'components/Footer';
import './_eventDetails.scss';
import { 
    addLike, 
    addView, 
    getEvent,
    bookEvent,
    cancelBooking,
    checkBookingStatus,
    getBookingInfo,
    getBookingStatusText,
    getBookingButtonText,
    getBookingButtonClass,
} from 'services/event';
import Banner from 'components/background/Banner';
import moment from 'moment';
import noData from 'assets/gifs/noData.gif';


import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import ChatBubbleTwoToneIcon from '@mui/icons-material/ChatBubbleTwoTone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import {  Modal, Progress } from 'antd';
import RightCol from './RightCol';
import Comments from './Comments';
import LoadingIndicator from 'components/LoadingIndicator';
import { useAuthContext } from 'context/AuthContext';

export default function Index() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [event, setEvent] = useState({})
    const [bookingStatus, setBookingStatus] = useState(null)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const hasAddedView = useRef(false);
    const { user } = useAuthContext()
    const commentRef = useRef(null)

    useEffect(() => {
        getEventData()
        addViewToEvent() // Renamed for clarity
        if (user?._id) {
            checkUserBookingStatus()
        }
    }, [user])

    // Add view when component mounts (direct navigation to event details)
    const addViewToEvent = async () => {
        if (hasAddedView.current) {
            return;
        }
        hasAddedView.current = true;

        try {
            await addView(id);
        } catch (error) {
            console.log('Error adding view:', error);
        }
    }

    const getEventData = async () => {
        try {
            let { data } = await getEvent(id);
            setEvent(data?.data)
        } catch (error) {
            console.log(error);
            let msg = "Some error occurred";
            let { status, data } = error?.response;
            if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
                msg = data.message || data.msg;
                if (window.toastify) {
                    window.toastify(msg, "error");
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    const checkUserBookingStatus = async () => {
        try {
            const { data } = await checkBookingStatus(id);
            setBookingStatus(data?.data);
        } catch (error) {
            console.log('Error checking booking status:', error);
        }
    }

    // format followers and following
    const formatNumber = (num) => {
        num = num ? num : 0
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const handleLikeEvent = async () => {
        if (!user?._id) {
            if (window.toastify) {
                window.toastify("Please login to like this event", "warning");
            }
            return;
        }

        setLoading(true)
        try {
            let { data } = await addLike(id);
            if (window.toastify) {
                window.toastify(data?.msg, "success");
            }
            getEventData()
        } catch (error) {
            console.log(error);
            let msg = "Some error occurred";
            let { status, data } = error?.response;
            if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
                msg = data.message || data.msg;
                if (window.toastify) {
                    window.toastify(msg, "error");
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const handleBookEvent = async () => {
        if (!user?._id) {
            if (window.toastify) {
                window.toastify("Please login to book this event", "warning");
            }
            return;
        }

        const bookingInfo = getBookingInfo(event, bookingStatus?.isBooked);
        
        if (!bookingInfo.canBook && !bookingInfo.isBooked) {
            if (window.toastify) {
                window.toastify("This event cannot be booked", "error");
            }
            return;
        }

        setBookingLoading(true);
        try {
            if (bookingInfo.isBooked) {
                // Cancel booking
                const { data } = await cancelBooking(id);
                if (window.toastify) {
                    window.toastify(data?.msg || "Booking cancelled successfully", "success");
                }
                setBookingStatus({ isBooked: false });
            } else {
                // Book event
                const { data } = await bookEvent(id);
                if (window.toastify) {
                    window.toastify(data?.msg || "Event booked successfully", "success");
                }
                setBookingStatus({ isBooked: true });
            }
            getEventData(); // Refresh event data to get updated seat count
        } catch (error) {
            console.log(error);
            let msg = "Some error occurred";
            let { status, data } = error?.response;
            if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
                msg = data.message || data.msg;
            }
            if (window.toastify) {
                window.toastify(msg, "error");
            }
        } finally {
            setBookingLoading(false);
        }
    }

    const handleBookingClick = () => {
        if (!user?._id) {
            if (window.toastify) {
                window.toastify("Please login to book this event", "warning");
            }
            return;
        }

        const bookingInfo = getBookingInfo(event, bookingStatus?.isBooked);
        
        if (bookingInfo.isBooked) {
            // Show confirmation modal for cancellation
            setShowBookingModal(true);
        } else {
            // Direct booking
            handleBookEvent();
        }
    }

    const confirmBookingAction = () => {
        setShowBookingModal(false);
        handleBookEvent();
    }

    // Get booking information for the current event
    const bookingInfo = getBookingInfo(event, bookingStatus?.isBooked);

    return (
        <>
            <Navbar />
            <LoadingIndicator loading={loading} />

            <Banner title={"ALL YOU NEED TO KNOW"} pageTitle={'Event Details'} page={'Details'} />

            <div className="container my-5 pt-2 pt-md-5" id='event-details'>
                <div className="row">
                    <div className="col-12 col-md-8">
                        {isLoading ? (
                            <div className='my-5 text-center'>
                                <div className="spinner-grow spinner-grow-sm bg-info"></div>
                                <div className="spinner-grow spinner-grow-sm bg-warning mx-3"></div>
                                <div className="spinner-grow spinner-grow-sm bg-info"></div>
                            </div>
                        ) : (
                            <>
                                {event?.status === "Draft" ? (
                                    <div className="row">
                                        <div className='col my-4 text-center'>
                                            <img src={noData} alt="no data found" className='img-fluid' />
                                            <h5 className='mt-4 text-warning text-center'>Sorry, the event you are trying to access is currently not available. The event organizer has changed the status to "Draft," which means it is not ready for public access. Please check back later.</h5>
                                        </div>
                                    </div>
                                ) : event?.status === "Closed" ? (
                                    <div className="row">
                                        <div className='col my-4 text-center'>
                                            <img src={noData} alt="no data found" className='img-fluid' />
                                            <h5 className='mt-4 text-warning text-center'>Sorry, the event you are trying to access is not available because event is closed.</h5>
                                        </div>
                                    </div>
                                ) : event?.status === "Deleted" ? (
                                    <div className="row">
                                        <div className='col my-4 text-center'>
                                            <img src={noData} alt="no data found" className='img-fluid' />
                                            <h5 className='mt-4 text-warning '>Sorry, the event you are trying to access is not available. The event organizer cancelled the event.</h5>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <img
                                                className='img-fluid rounded'
                                                width={'100%'}
                                                src={event?.image}
                                                alt={event?.title}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center my-4">
                                            <div style={{ width: "50%" }}>
                                                <i className='bx bx-calendar text-warning me-1'></i> 
                                                <small>{moment(event?.date).format('MMM D, YYYY')}</small>
                                            </div>
                                            <div style={{ width: "50%", textAlign: 'end' }}>
                                                <LocationOnOutlinedIcon fontSize='small' className='text-warning me-1' />
                                                <small>{event?.country}, {event?.city}</small>
                                            </div>
                                        </div>
                                        <hr />

                                        {/* Booking Status Bar */}
                                        {event?.status === "Published" && (
                                            <div className="booking-status-section mb-4">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="card border-0 shadow-sm">
                                                            <div className="card-body">
                                                                <div className="row align-items-center">
                                                                    <div className="col-md-6">
                                                                        <h6 className="mb-2">
                                                                            <EventSeatIcon className="text-primary me-2" />
                                                                            Booking Status
                                                                        </h6>
                                                                        <div className="mb-2">
                                                                            <Progress 
                                                                                percent={bookingInfo.bookingPercentage} 
                                                                                strokeColor={
                                                                                    bookingInfo.isFullyBooked ? '#ff4d4f' :
                                                                                    bookingInfo.isNearlyFull ? '#faad14' : '#52c41a'
                                                                                }
                                                                                size="small"
                                                                            />
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {getBookingStatusText(bookingInfo)}
                                                                        </small>
                                                                    </div>
                                                                    <div className="col-md-6 text-md-end">
                                                                        <div className="mb-3">
                                                                            <h5 className="text-primary mb-0">
                                                                                ₹{event?.ticketPrice || 0}
                                                                            </h5>
                                                                            <small className="text-muted">per ticket</small>
                                                                        </div>
                                                                        <button
                                                                            className={`btn ${getBookingButtonClass(bookingInfo)} px-4`}
                                                                            onClick={handleBookingClick}
                                                                            disabled={bookingLoading || bookingInfo.isFullyBooked}
                                                                        >
                                                                            {bookingLoading ? (
                                                                                <>
                                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                                    Processing...
                                                                                </>
                                                                            ) : (
                                                                                getBookingButtonText(bookingInfo)
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* event popularity */}
                                        <div className="d-flex justify-content-between my-4">
                                            <button style={{ width: "24%" }} className='btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center'>
                                                <VisibilityTwoToneIcon className='text-secondary' fontSize='small' /> 
                                                <small className='ms-2'>{formatNumber(event?.views?.length)} Views</small>
                                            </button>
                                            <button style={{ width: "24%" }} className='btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center' onClick={handleLikeEvent}>
                                                {event?.likes?.some(item => item === user?._id)
                                                    ? <FavoriteIcon className='text-danger' fontSize='small' />
                                                    : <FavoriteTwoToneIcon className='text-danger' fontSize='small' />
                                                }
                                                <small className='ms-2'>{formatNumber(event?.likes?.length)} Likes</small>
                                            </button>
                                            <button style={{ width: "24%" }} onClick={() => commentRef.current.scrollIntoView({ behavior: 'smooth' })} className='btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center'>
                                                <ChatBubbleTwoToneIcon className='text-primary' fontSize='small' /> 
                                                <small className='ms-2'>{formatNumber(event?.comments?.length)} Comments</small>
                                            </button>
                                            <button style={{ width: "24%" }} className='btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center'>
                                                <EventSeatIcon className='text-success' fontSize='small' />
                                                <small className='ms-2'>{bookingInfo.availableSeats} Seats</small>
                                            </button>
                                        </div>
                                        <hr />

                                        {/* Rest of your component content remains the same */}
                                        {/* ... (all the other sections like title, time range, category, etc.) ... */}
                                        
                                        {/* title */}
                                        <div>
                                            <h3 className='mt-4 fw-bold'>{event?.title}</h3>
                                            <div className='d-flex justify-content-between'>
                                                <h6 className='text-warning mt-3 mb-5'>
                                                    <span className="text-dark">Seats Left: </span> 
                                                    {bookingInfo.availableSeats}
                                                </h6>
                                                <h6 className='text-warning mt-3 mb-5 text-end'>
                                                    <span className="text-dark">Ticket Price: </span> 
                                                    ₹{event?.ticketPrice}
                                                </h6>
                                            </div>

                                            {/* All other sections remain the same */}
                                            {/* ... */}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <div className="col-12 col-md-4 mt-4 mt-md-0">
                        <RightCol event={event} bookingInfo={bookingInfo} />
                    </div>
                </div>
                {event?.status === "Published" &&
                    <div className="row">
                        <div className="col-12 col-md-8" ref={commentRef}>
                            {/* comments */}
                            <Comments id={id} getEventData={getEventData} />
                        </div>
                    </div>
                }
            </div>

            {/* Booking Confirmation Modal */}
            <Modal
                title="Confirm Booking Cancellation"
                open={showBookingModal}
                onOk={confirmBookingAction}
                onCancel={() => setShowBookingModal(false)}
                okText="Yes, Cancel Booking"
                cancelText="No, Keep Booking"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to cancel your booking for this event?</p>
                <p className="text-muted">
                    <strong>Event:</strong> {event?.title}<br />
                    <strong>Date:</strong> {moment(event?.date).format('MMM D, YYYY')}<br />
                    <strong>Ticket Price:</strong> ₹{event?.ticketPrice}
                </p>
            </Modal>

            <Footer />
        </>
    )
}