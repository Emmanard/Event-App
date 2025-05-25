import React, { useEffect, useRef, useState } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import Navbar from 'components/Navbar';
import Footer from 'components/Footer';
import './_eventDetails.scss';
import { addLike, addView, getEvent } from 'services/event';
import Banner from 'components/background/Banner';
import moment from 'moment';
import noData from 'assets/gifs/noData.gif';
import { UserOutlined } from '@ant-design/icons';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import ChatBubbleTwoToneIcon from '@mui/icons-material/ChatBubbleTwoTone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Avatar, Timeline } from 'antd';
import RightCol from './RightCol';
import Comments from './Comments';
import LoadingIndicator from 'components/LoadingIndicator';
import { useAuthContext } from 'context/AuthContext';

export default function Index() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [event, setEvent] = useState({})
    const hasAddedView = useRef(false);
    const { user } = useAuthContext()
    const commentRef = useRef(null)


    useEffect(() => {
        // window.scroll(0, 0)
        getEventData()
        addViewInEvent()
    }, [])

    const addViewInEvent = async () => {
        if (hasAddedView.current) {
            // Prevent running the function again
            return;
        }

        hasAddedView.current = true; // Track if the function has run

        try {
            let { data } = await addView(id);
        } catch (error) {
            console.log(error);
            // let msg = "Some error occured";
            // let { status, data } = error.response;
            // if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
            //     msg = data.message || data.msg;
            //     window.toastify(msg, "error");
            // }
        }
    }

    const getEventData = async () => {
        try {
            let { data } = await getEvent(id);
            setEvent(data?.data)
        } catch (error) {
            console.log(error);
            let msg = "Some error occured";
            let { status, data } = error?.response;
            if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
                msg = data.message || data.msg;
                window.toastify(msg, "error");
            }
        } finally {
            setIsLoading(false)
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
        setLoading(true)
        try {
            let { data } = await addLike(id);
            window.toastify(data?.msg, "success");
            getEventData()
        } catch (error) {
            console.log(error);
            let msg = "Some error occured";
            let { status, data } = error?.response;
            if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
                msg = data.message || data.msg;
                window.toastify(msg, "error");
            }
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <LoadingIndicator loading={loading} />

            <Banner title={"ALL YOU NEED TO KNOW"} pageTitle={'Event Details'} page={'Details'} />

            <div className="container my-5 pt-2 pt-md-5" id='event-details'>
                <div className="row">
                    <div className="col-12 col-md-8">
                        {isLoading
                            ? <div className='my-5 text-center'>
                                <div className="spinner-grow spinner-grow-sm bg-info"></div>
                                <div className="spinner-grow spinner-grow-sm bg-warning mx-3"></div>
                                <div className="spinner-grow spinner-grow-sm bg-info"></div>
                            </div>
                            : <>
                                {event?.status === "Draft"
                                    ? <div className="row">
                                        <div className='col my-4 text-center'>
                                            <img src={noData} alt="no data found" className='img-fluid' />
                                            <h5 className='mt-4 text-warning text-center'>Sorry, the event you are trying to access is currently not available. The event organizer has changed the status to "Draft," which means it is not ready for public access. Please check back later.</h5>
                                        </div>
                                    </div>
                                    : event?.status === "Closed"
                                        ? <div className="row">
                                            <div className='col my-4 text-center'>
                                                <img src={noData} alt="no data found" className='img-fluid' />
                                                <h5 className='mt-4 text-warning text-center'>Sorry, the event you are trying to access is not available because event is closed.</h5>
                                            </div>
                                        </div>
                                        : event?.status === "Deleted"
                                            ? <div className="row">
                                                <div className='col my-4 text-center'>
                                                    <img src={noData} alt="no data found" className='img-fluid' />
                                                    <h5 className='mt-4 text-warning '>Sorry, the event you are trying to access is not available. The event organizer cancelled the event.</h5>
                                                </div>
                                            </div>
                                            :
                                            <>
                                                <div>
                                                    <img
                                                        className='img-fluid rounded'
                                                        width={'100%'}
                                                        src={event?.image}
                                                    />
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center my-4">
                                                    <div style={{ width: "50%" }}>
                                                        <i class='bx bx-calendar text-warning me-1'></i> <small>{moment(event?.date).format('MMM D, YYYY')}</small>
                                                    </div>
                                                    {/* <div style={{ width: "33%" }} className="seats d-flex align-items-center justify-content-center flex-column flex-sm-row">
                                <img src={seats} style={{ width: 25 }} className='me-0 me-sm-2' alt="" />
                                <span>{event?.seats - event?.seatsBooked?.length} Seat</span>
                            </div> */}
                                                    <div style={{ width: "50%", textAlign: 'end' }}>
                                                        <LocationOnOutlinedIcon fontSize='small' className='text-warning me-1' />
                                                        <small>{event?.country}, {event?.city}</small>
                                                    </div>
                                                </div><hr />
                                                {/* event popularity */}
                                                <div className="d-flex justify-content-between my-4">
                                                    <button style={{ width: "33%" }} className='btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center'><VisibilityTwoToneIcon className='text-secondary' fontSize='small' /> <small className='ms-2'>{formatNumber(event?.views?.length)} Views</small></button>
                                                    <button style={{ width: "33%" }} className='btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center' onClick={handleLikeEvent}>
                                                        {event?.likes?.some(item => item === user?._id)
                                                            ? <FavoriteIcon className='text-danger' fontSize='small' />
                                                            : <FavoriteTwoToneIcon className='text-danger' fontSize='small' />
                                                        }

                                                        <small className='ms-2'>{formatNumber(event?.likes?.length)} Likes</small>
                                                    </button>
                                                    <button style={{ width: "33%" }} onClick={() => commentRef.current.scrollIntoView({ behavior: 'smooth' })} className='btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center'><ChatBubbleTwoToneIcon className='text-primary' fontSize='small' /> <small className='ms-2'>{formatNumber(event?.comments?.length)} Comments</small></button>
                                                </div><hr />
                                                {/* title */}
                                                <div>
                                                    <h3 className='mt-4 fw-bold'>{event?.title}</h3>
                                                    <div className='d-flex justify-content-between'>
                                                        <h6 className='text-warning mt-3 mb-5'><span className="text-dark">Seats Left: </span> {event?.seats - event?.seatsBooked?.length}</h6>
                                                        <h6 className='text-warning mt-3 mb-5 text-end'><span className="text-dark">Ticket Price: </span> Rs. {event?.ticketPrice}</h6>
                                                    </div>

                                                    {/* time range */}
                                                    <div>
                                                        <h5><u>Time Range</u></h5>
                                                        <div className="row border rounded border-info text-center p-2 mx-1 mx-sm-3 mt-3">
                                                            <div className="col" >{event?.time ? event?.time[0] : ""}</div>
                                                            <div className="col" ><i class='bx bx-right-arrow-alt bx-fade-left fs-4 text-info' ></i></div>
                                                            <div className="col" >{event?.time ? event?.time[1] : ""}</div>

                                                        </div>
                                                    </div>

                                                    {/* category */}
                                                    {(event?.category && event?.category !== "")
                                                        && <>
                                                            <h5 className='mt-5'><u>Category</u></h5>
                                                            <p>{event?.category}</p>
                                                        </>
                                                    }
                                                    {/* about organizer */}
                                                    {(event?.organizerInfo && event?.organizerInfo !== "")
                                                        && <>
                                                            <h5 className='mt-5'><u>About Organizer</u></h5>
                                                            <p>{event?.organizerInfo}</p>
                                                        </>
                                                    }

                                                    {/* rules and policies */}
                                                    {(event?.eventRules && event?.eventRules !== "")
                                                        && <>
                                                            <h5 className='mt-5'><u>Rules and Policies</u></h5>
                                                            <p>{event?.eventRules}</p>
                                                        </>
                                                    }
                                                    {/* address */}
                                                    {(event?.location && event?.location !== "")
                                                        && <>
                                                            <h5 className='mt-5'><u>Address</u></h5>
                                                            <p>{event?.location}</p>
                                                        </>
                                                    }
                                                    {/* schedule */}
                                                    {(event?.schedule && event?.schedule?.length > 0)
                                                        && <>
                                                            <h5 className='mt-5 mb-4'><u>Schedule</u></h5>
                                                            <Timeline
                                                                items={
                                                                    event?.schedule?.map((item, i) => (
                                                                        {
                                                                            color: '#f5a998',
                                                                            children: (
                                                                                <>
                                                                                    <b className='text-warning'>{item?.time}</b>
                                                                                    <p>{item?.details}</p>
                                                                                </>
                                                                            ),
                                                                        }
                                                                    ))
                                                                }
                                                            />
                                                        </>
                                                    }

                                                    {/* speakers */}
                                                    {(event?.speakers && event?.speakers?.length > 0)
                                                        && <>
                                                            <h5 className='mt-5 mb-4'><u>Speakers / Guests</u></h5>
                                                            <Timeline
                                                                items={
                                                                    event?.speakers?.map((item, i) => (
                                                                        {
                                                                            color: '#9accc9',
                                                                            children: (
                                                                                <>
                                                                                    <p>
                                                                                        <Avatar
                                                                                            size="small"
                                                                                            src={item?.img}
                                                                                            icon={<UserOutlined />} />
                                                                                        <b className='text-info'> {item?.name}</b>
                                                                                    </p>
                                                                                    <p><strong>Profession: </strong>{item?.profession}</p>
                                                                                    <p>{item?.details}</p>
                                                                                </>
                                                                            ),
                                                                        }
                                                                    ))
                                                                }
                                                            />
                                                            <hr />
                                                        </>
                                                    }

                                                    {/* description */}
                                                    {(event?.description && event?.description !== "")
                                                        && <>
                                                            <h5 className='mt-5 mb-4'><u>Description</u></h5>
                                                            <div dangerouslySetInnerHTML={{ __html: event?.description ? event?.description : "No description added yet" }} />
                                                            <hr />
                                                        </>
                                                    }
                                                    {/* related tags */}
                                                    {(event?.tags && event?.tags !== "")
                                                        && <>
                                                            <h5 className='mt-5 mb-4'><u>Related Tags</u></h5>
                                                            <div className='mb-4'>{event?.tags?.split(',')?.map((item, i) => {
                                                                const trimmedItem = item.trim();
                                                                return <button className={`btn btn-outline-secondary me-2 mb-2 ${trimmedItem === '' ? "d-none" : "d-inline"}`} key={i}>{trimmedItem}</button>
                                                            })}</div><hr />
                                                        </>
                                                    }

                                                </div>
                                            </>
                                }


                            </>
                        }
                    </div>
                    <div className="col-12 col-md-4 mt-4 mt-md-0">
                        <RightCol event={event} />
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
            </div >

            <Footer />
        </>
    )
}
