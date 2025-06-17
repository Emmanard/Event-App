import React, { useEffect, useState } from 'react'
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Menu } from 'antd';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import { useNavigate } from 'react-router-dom';

export default function ProfileHeader({ userData }) {
    const [current, setCurrent] = useState('dashboard/profile');
    const navigate = useNavigate();

    const items = [
        {
            label: 'Overview',
            key: 'dashboard/profile',
        },
       
        {
            label: 'Events',
            key: 'dashboard/profile/events',
        },
    ];

    useEffect(() => {
        setCurrent(window.location.pathname.substring(1))
    }, [current, window.location.pathname])

    const onClick = (e) => {
        navigate(`/${e.key}`)
        setCurrent(e.key);
    };

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

    return (
        <div className="container-fluid bg-info" id='profile-section-dashboard'>
            <div className='container-fluid top-banner'>
                <div className="container py-4 text-light">
                    <div className="row row-cols-1 row-cols-md-2 basic-info mb-4">
                        <div className="col d-flex">
                            <div>
                                <Avatar
                                    size={{
                                        xs: 70,
                                        sm: 72,
                                        md: 78,
                                        lg: 80,
                                        xl: 90,
                                        xxl: 100,
                                    }}
                                    src={userData?.image}
                                    icon={<UserOutlined />}
                                />
                            </div>
                            <div className='ms-4 d-flex flex-column justify-content-center'>
                                <h4>{userData?.fullName}</h4>
                                <small>{userData?.profession ? userData?.profession : "Profession not added yet"}</small>
                                <p className='d-flex text-warning mt-2'>
                                    {userData?.city && <small className='me-2'><LocationOnOutlinedIcon fontSize='small' /> {userData?.city}</small>}
                                    {userData?.country && <small className='me-2'><PublicOutlinedIcon fontSize='small' /> {userData?.country}</small>}
                                </p>
                            </div>
                        </div>
                        <div className="col d-flex text-center justify-content-end">
                            <div>
                                <h5>{formatNumber(userData?.followers?.length)}</h5>
                                <small className='text-white-50'>Followers</small>
                            </div>
                            <div className='ms-4'>
                                <h5>{formatNumber(userData?.following?.length)}</h5>
                                <small className='text-white-50'>Following</small>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-4">
                        <div className="col-7 col-md-10">
                            <Menu selectedKeys={[current]} onClick={onClick} style={{ background: "transparent" }} mode="horizontal" items={items} />
                        </div>
                        <div className="col-5 col-md-2 d-flex justify-content-end">
                            <button className='button-stylling-1 btn-sm' onClick={() => navigate("/dashboard/profile-edit")}>
                                <small className='d-block d-md-none'><i class='bx bx-edit' ></i></small>
                                <small className='d-none d-md-block'>Edit Profile</small>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
