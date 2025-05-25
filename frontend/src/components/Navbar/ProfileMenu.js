import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthContext } from 'context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';

export default function ProfileMenu() {
    const { dispatch, user } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: "SET_LOGGED_OUT" });
        window.toastify("Logout Successfully", "success")

    }

    return (
        <div id='profileMenu-section'>
            <hr />
            <button className='btn btn-light' onClick={() => navigate("/dashboard/profile")}>
                <span><PermIdentityOutlinedIcon fontSize='small' /></span>
                <span>Profile</span>
            </button>
            {user?.role === "organizer" && <button className='btn btn-light' onClick={() => navigate("/dashboard/events/myEvents")}>
                <span><CelebrationOutlinedIcon fontSize='small' /></span>
                <span>My Events</span>
            </button>}

            <button className='btn btn-light' onClick={() => navigate("/dashboard")}>
                <span><SpaceDashboardOutlinedIcon fontSize='small' /></span>
                <span>Dashboard</span>
            </button>
            <hr />
            <button className='btn btn-light w-100' onClick={handleLogout}>
                <span><LogoutIcon fontSize='small' /></span>
                <span>Logout</span>
            </button>
        </div>
    )
}
