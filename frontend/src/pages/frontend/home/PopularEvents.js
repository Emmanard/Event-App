import React, { useEffect, useState, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import seats from 'assets/pictures/seats.png';
import noData from 'assets/gifs/noData.gif';
import { getPopularEvents } from 'services/event';
import moment from 'moment'

export default function PopularEvents() {
    const [selectedTab, setSelectedTab] = useState("Business")
    const [events, setEvents] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    // Solution 1: Wrap getEvents with useCallback
    const getEvents = useCallback(async () => {
        setIsLoading(true)
        try {
            let { data } = await getPopularEvents(selectedTab);
            setEvents(data?.data || [])
        } catch (error) {
            console.log('Error fetching events:', error);
            let msg = "Some error occurred";
            
            // Better error handling
            if (error.response) {
                let { status, data } = error.response;
                if (status === 400 || status === 401 || status === 500 || status === 413 || status === 404) {
                    msg = data.message || data.msg || `Server error (${status})`;
                }
            } else if (error.request) {
                msg = "Network error - Unable to connect to server";
            } else {
                msg = error.message || "Unknown error occurred";
            }
            
            setEvents([])
            if (window.toastify) {
                window.toastify(msg, "error");
            } else {
                console.error(msg);
            }
        } finally {
            setIsLoading(false)
        }
    }, [selectedTab]) // Add selectedTab as dependency

    useEffect(() => {
        getEvents();
    }, [getEvents]) // Now include getEvents in dependency array

    return (
        <div className='container mt-5 mt-sm-0' id='popularEvents-section'>
            <div className="row">
                <div className="col">
                    <h5 className='text-center text-warning'>Event</h5>
                    <h2 className='heading-stylling display-5'>POPULAR EVENTS</h2>
                </div>
            </div>
            <div className="row my-5">
                <div className="col-12 col-md-8 offset-0 offset-md-2">
                    <Swiper
                        slidesPerView={4}
                        navigation={true}
                        loop={true}
                        modules={[Autoplay, Navigation]}
                        breakpoints={{
                            1200: {
                                slidesPerView: 6,
                            },
                            992: {
                                slidesPerView: 5,
                            },
                            576: {
                                slidesPerView: 4,
                            },
                        }}
                        autoplay={{
                            delay: 10000,
                            disableOnInteraction: false,
                        }}
                        className="mySwiper">
                        {window?.categories?.map((item, i) => {
                            return <SwiperSlide key={i}><button className={`btn btn-link text-decoration-none ${selectedTab === item ? "text-warning" : "text-dark"}  fw-bold`} onClick={() => setSelectedTab(item)}>{item}</button></SwiperSlide>
                        })}
                    </Swiper>
                </div>
            </div>
            {isLoading
                ? <div className="row">
                    <div className="col">
                        <div className='my-5 text-center'>
                            <div className="spinner-grow bg-info"></div>
                            <div className="spinner-grow bg-warning mx-3"></div>
                            <div className="spinner-grow bg-info"></div>
                        </div>
                    </div>
                </div>
                : <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 ">
                    {events?.map((item, i) => {
                        return <div className="col d-flex align-items-stretch justify-content-center" key={i}>
                            <div className="card border-0 shadow rounded-4 w-100 overflow-hidden">
                              <Link className="card-img text-decoration-none text-body" to={`/event/${item?._id}`}>
                                    <img src={item?.image} className="card-img-top" alt="..." />
                                    <div className="seats bg-info py-2 px-4 d-flex align-items-center">
                                        <img src={seats} style={{ width: 30, marginRight: 10 }} alt="" />
                                        <span>{item?.seats - item?.seatsBooked?.length} Seat</span>
                                    </div>
                                </Link>
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div className="d-flex justify-content-between mb-3">
                                        <div>
                                            <i className='bx bx-calendar text-warning me-1'></i> <span>{moment(item?.date).format('MMM D, YYYY')}</span>
                                        </div>
                                        <div>
                                            <LocationOnOutlinedIcon fontSize='small' className='text-warning me-1' />
                                            <span>{item?.country}</span>
                                        </div>
                                    </div>
                                    <h5 className="card-title">
                                      <Link to={`/event/${item?._id}`}>{item?.title}</Link>
                                    </h5>
                                    <div className="d-flex justify-content-between align-items-center  mt-4 mb-2">
                                        <span>
                                            <Link to={`/event/${item?._id}`} className='text-warning text-decoration-none'>Book Now</Link>
                                        </span>
                                        <span>
                                            <button className='btn btn-outline-info btn-sm'><ShareOutlinedIcon fontSize='small' /></button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    })}
                </div>
            }
            <div className="row">
                {(!events.length && !isLoading)
                    && <div className='col my-4 text-center'>
                        <img src={noData} alt="no data found" className='img-fluid' />
                    </div>
                }
            </div>
        </div>
    )
}