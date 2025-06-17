import { Link } from 'react-router-dom';
import { useAuthContext } from 'context/AuthContext'; 

export default function Overview({ userData }) {
    // Get user from auth context to check role
    const { user } = useAuthContext();
    const userRole = user?.role || 'attendee';
    
    // Get phone number for organizers only
    const getPhoneNumber = () => {
        return userData?.phoneNumber || 'Not provided';
    };

    return (
        <div className='container-fluid ' id='overview-dashboard-section'>
            <div className="container px-3">
                <div className="row gx-4 ">
                    <div className="col-12 col-lg-3">
                        <div className="card rounded-1 p-3 py-4 border-0 shadow ">
                            <h6 className='fw-bold '>Info</h6><hr />
                            <div className='mb-3'><strong>Full Name: </strong> <span className='ms-3 text-secondary'>{userData?.fullName}</span></div>
                            {/* Show phone number only for organizers */}
                            {userRole === 'organizer' && (
                                <div className='mb-3'><strong>Phone: </strong> <span className='ms-3 text-secondary'>{getPhoneNumber()}</span></div>
                            )}
                            <div className='mb-3'><strong>E-mail: </strong> <span className='ms-3 text-secondary'>{userData?.email}</span></div>
                            {/* Remove location field as requested */}
                            <div><strong>Joining Date: </strong> <span className='ms-3 text-secondary'>{userData?.createdAt?.split('T')[0]}</span></div>
                        </div>
                        <div className="card rounded-1 p-3 py-4 border-0 shadow mt-4">
                            <h6 className='fw-bold '>Portfolio</h6><hr />
                            <div>
                                {!userData?.facebookLink
                                    && !userData?.instagramLink
                                    && !userData?.tiktokLink
                                    && !userData?.pinterestLink
                                    && !userData?.twitterLink
                                    && !userData?.webLink
                                    && <span className='text-secondary'>No links added yet</span>}
                                {userData?.facebookLink && <Link to={userData?.facebookLink} target='_blank' className='mx-1'>
                                    <i class='bx bxl-facebook-circle' style={{ color: "#1974ec", fontSize: "xx-large" }}  ></i>
                                </Link>}
                                {userData?.instagramLink && <Link to={userData?.instagramLink} target='_blank' className='mx-1'>
                                    <i class='bx bxl-instagram-alt' style={{ color: "#f70667", fontSize: "xx-large" }}></i>
                                </Link>}
                                {userData?.tiktokLink &&
                                    <Link to={userData?.tiktokLink} target='_blank' className='mx-1'>
                                        <i class='bx bxl-tiktok' style={{ color: "#000", fontSize: "xx-large" }}  ></i>
                                    </Link>
                                }
                                {userData?.pinterestLink &&
                                    <Link to={userData?.pinterestLink} target='_blank' className='mx-1'>
                                        <i class='bx bxl-pinterest' style={{ color: "#df0022", fontSize: "xx-large" }}  ></i>
                                    </Link>
                                }
                                {userData?.twitterLink &&
                                    <Link to={userData?.twitterLink} target='_blank' className='mx-1'>
                                        <i class='bx bxl-twitter' style={{ color: "#1c96e8", fontSize: "xx-large" }}  ></i>
                                    </Link>
                                }
                                {userData?.webLink &&
                                    <Link to={userData?.webLink} target='_blank' className='mx-1'>
                                        <i class='bx bx-globe' style={{ color: "#000", fontSize: "xx-large" }}  ></i>
                                    </Link>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-9 mt-3 mt-md-0">
                        <div className="card rounded-1 p-3 py-4 border-0 shadow mt-2 mt-md-4 mt-lg-0">
                            <h6 className='fw-bold '>Description</h6><hr />
                            <div dangerouslySetInnerHTML={{ __html: userData?.description ? userData?.description : "No description added yet" }} />
                            {/* <p className='text-secondary'>{userData?.description ? userData?.description : "No description added yet"}</p> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}