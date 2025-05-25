import React from 'react'
import { useAuthContext } from 'context/AuthContext'
import Auth from 'pages/auth/Login'
import Navbar from 'components/Navbar/Navbar'

export default function PrivateRoute({ Component }) {
    const { isAuthenticated } = useAuthContext()

    if (isAuthenticated) {
        return (<Component />)
    }

    return <>
        <Navbar />
        <Auth />
    </>
}
