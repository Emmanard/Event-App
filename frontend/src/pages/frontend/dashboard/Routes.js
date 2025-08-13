import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Profile from './profile/Profile'
import Events from './events/Routes'
import MyEvents from './events/MyEvents' // Import MyEvents directly
import EditProfile from './editProfile/EditProfile'
import { useAuthContext } from 'context/AuthContext'

export default function DashboardRoutes() {
    const { user } = useAuthContext();

    return (
        <Routes>
            <Route path='/profile/*' element={<Profile />} />
            
            {/* 
                SPECIFIC route for myEvents - accessible to ALL users
                This must come BEFORE the general /events/* route
            */}
            <Route path='/events/myEvents' element={<MyEvents />} />
            
            {/* 
                GENERAL route for other event operations - only for organizers
                This handles routes like /events/create, /events/edit/:id, etc.
            */}
            <Route 
                path='/events/*' 
                element={user?.role === "organizer" ? 
                    <Events /> : 
                    <div className='container py-5 text-center text-danger display-5'>
                        You do not have access to this page. Only organizers can access this page.
                    </div>
                } 
            />
            
            <Route path='/profile-edit' element={<EditProfile />} />
        </Routes>
    )
}