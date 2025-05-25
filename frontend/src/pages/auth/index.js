import { Route, Routes } from 'react-router-dom'
import Login from './Login'
import './_auth.scss'
import Navbar from 'components/Navbar/Navbar'
import Footer from 'components/Footer'
import Register from './Register'
import ForgotPassword from './ForgotPassword'
import VerifyOTP from './VerifyOTP'
import ResetPassword from './ResetPassword'

export default function index() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path='login' element={<Login />} />
                <Route path='register' element={<Register />} />
                <Route path='verifyOTP' element={<VerifyOTP />} />
                <Route path='forgot-password' element={<ForgotPassword />} />
                <Route path='reset-password/:token/:email' element={<ResetPassword />} />
            </Routes>
            <Footer />
        </>
    )
}
