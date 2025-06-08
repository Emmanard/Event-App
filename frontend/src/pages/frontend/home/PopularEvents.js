import React, { useEffect, useState, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import noData from 'assets/gifs/noData.gif';
import { getPopularEvents } from 'services/event';
import EventCard from 'components/EventCard'; // Import the new component

export default function PopularEvents() {
    const [selectedTab, setSelectedTab] = useState("Business")
    const [events, setEvents] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const getEvents = useCallback(async () => {
        setIsLoading(true)
        try {
            let { data } = await getPopularEvents(selectedTab);
            setEvents(data?.data || [])
        } catch (error) {
            console.log('Error fetching events:', error);
            let msg = "Some error occurred";
            
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
    }, [selectedTab])

    useEffect(() => {
        getEvents();
    }, [getEvents])

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
                            return <SwiperSlide key={i}>
                                <button 
                                    className={`btn btn-link text-decoration-none ${selectedTab === item ? "text-warning" : "text-dark"} fw-bold`} 
                                    onClick={() => setSelectedTab(item)}
                                >
                                    {item}
                                </button>
                            </SwiperSlide>
                        })}
                    </Swiper>
                </div>
            </div>
            
            {isLoading ? (
                <div className="row">
                    <div className="col">
                        <div className='my-5 text-center'>
                            <div className="spinner-grow bg-info"></div>
                            <div className="spinner-grow bg-warning mx-3"></div>
                            <div className="spinner-grow bg-info"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {events?.map((event, i) => (
                        <EventCard key={event?._id || i} event={event} />
                    ))}
                </div>
            )}
            
            <div className="row">
                {(!events.length && !isLoading) && (
                    <div className='col my-4 text-center'>
                        <img src={noData} alt="no data found" className='img-fluid' />
                    </div>
                )}
            </div>
        </div>
    )
}