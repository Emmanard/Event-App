import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Frontend from 'pages/frontend'
import Auth from 'pages/auth'
import { useAuthContext } from 'context/AuthContext'
import Dashboard from 'pages/frontend/dashboard'
import PrivateRoute from 'components/privateRoute/PrivateRoute'

export default function Index() {
    const { isAuthenticated } = useAuthContext();
    return (
        <>
            <main>
                <Routes>
                    <Route path='/*' element={<Frontend />} />
                    <Route path='/auth/*' element={!isAuthenticated ? <Auth /> : <Navigate to={'/'} />} />
                    <Route path='/dashboard/*' element={<PrivateRoute Component={Dashboard} />} />

                </Routes>
            </main>
        </>
    )
}
