import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Card, Spin, Alert, Button, Descriptions } from 'antd';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    LoadingOutlined,
    CreditCardOutlined,
    CalendarOutlined,
    UserOutlined
} from '@ant-design/icons';
import Navbar from 'components/Navbar';
import Footer from 'components/Footer';
import { 
    completePaymentAndBooking, 
    formatPaymentReference,
    getPaymentStatusInfo 
} from 'services/event';
import moment from 'moment';

export default function PaymentVerification() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get reference from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const reference = urlParams.get('reference');
        const trxref = urlParams.get('trxref'); // Paystack also sends trxref
        
        const paymentReference = reference || trxref;
        
        if (paymentReference) {
            verifyPayment(paymentReference);
        } else {
            setError('Payment reference not found in URL');
            setLoading(false);
        }
    }, [location]);

    const verifyPayment = async (reference) => {
        try {
            console.log('🔍 Verifying payment with reference:', reference);
            
            // Complete payment verification and booking
            const result = await completePaymentAndBooking(reference);
            
            console.log('✅ Verification result:', result);
            setVerificationResult(result);
            
            if (result.success) {
                // Show success toast
                if (window.toastify) {
                    window.toastify(result.message || 'Booking completed successfully!', 'success');
                }
            }
            
        } catch (error) {
            console.log('❌ Payment verification error:', error);
            setError(error.message || 'Payment verification failed');
            
            if (window.toastify) {
                window.toastify(error.message || 'Payment verification failed', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // FIX APPLIED HERE
 const handleGoToEvent= () => {
    // Navigate to dashboard My Events with payments tab
    navigate('/dashboard/events/myEvents?tab=payments');
};


    const handleTryAgain = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container my-5 py-5">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <Card className="text-center">
                                <Spin 
                                    indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                                    className="mb-4"
                                />
                                <h4>Verifying Payment...</h4>
                                <p className="text-muted">Please wait while we confirm your payment and complete your booking.</p>
                            </Card>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="container my-5 py-5">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <Result
                                status="error"
                                title="Payment Verification Failed"
                                subTitle={error}
                                extra={[
                                    <Button type="primary" key="retry" onClick={handleTryAgain}>
                                        Try Again
                                    </Button>,
                                    <Button key="events" onClick={() => navigate('/events')}>
                                        Browse Events
                                    </Button>,
                                ]}
                            />
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (verificationResult?.success) {
        const { booking } = verificationResult;
        const paymentStatusInfo = getPaymentStatusInfo(booking?.paymentStatus || 'successful');

        return (
            <>
                <Navbar />
                <div className="container my-5 py-5">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <Result
                                status="success"
                                title="Payment Successful!"
                                subTitle="Your booking has been confirmed. You will receive a confirmation email shortly."
                                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                extra={[
                                    <Button type="primary" key="event" onClick={handleGoToEvent}>
                                        Visit My Events
                                    </Button>,
                                    
                                ]}
                            />
                            
                            {/* Booking Details Card */}
                            {booking && (
                                <Card 
                                    title={
                                        <div className="d-flex align-items-center">
                                            <CreditCardOutlined className="me-2" />
                                            Booking Details
                                        </div>
                                    }
                                    className="mt-4"
                                >
                                    <Descriptions column={1} bordered size="small">
                                        <Descriptions.Item label="Event">
                                            <strong>{booking.eventTitle || booking.eventId}</strong>
                                        </Descriptions.Item>
                                        
                                        <Descriptions.Item label="Booking Reference">
                                            <code>{formatPaymentReference(booking.reference || booking.paymentReference)}</code>
                                        </Descriptions.Item>
                                        
                                        <Descriptions.Item label="Attendee Name">
                                            <UserOutlined className="me-1" />
                                            {booking.fullName || booking.attendeeName}
                                        </Descriptions.Item>
                                        
                                        <Descriptions.Item label="Email">
                                            {booking.email}
                                        </Descriptions.Item>
                                        
                                        <Descriptions.Item label="Phone">
                                            {booking.phone}
                                        </Descriptions.Item>
                                        
                                        <Descriptions.Item label="Number of Tickets">
                                            {booking.quantity || 1} ticket(s)
                                        </Descriptions.Item>
                                        
                                        <Descriptions.Item label="Total Amount">
                                            <strong className="text-success">
                                                ₦{(booking.amount || booking.totalAmount || 0).toLocaleString()}
                                            </strong>
                                        </Descriptions.Item>
                                        
                                        <Descriptions.Item label="Payment Status">
                                            <span className={`badge bg-${paymentStatusInfo.color}`}>
                                                {paymentStatusInfo.label}
                                            </span>
                                        </Descriptions.Item>
                                        
                                        <Descriptions.Item label="Booking Date">
                                            <CalendarOutlined className="me-1" />
                                            {moment(booking.createdAt || booking.bookingDate).format('MMM D, YYYY [at] h:mm A')}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            )}
                            
                            {/* Instructions Card */}
                            <Card className="mt-4">
                                <Alert
                                    message="What's Next?"
                                    description={
                                        <div>
                                            <ul className="mb-0 mt-2">
                                                <li>A confirmation email has been sent to your email address</li>
                                                <li>Please keep your booking reference for future reference</li>
                                                <li>Arrive at the venue on time with a valid ID</li>
                                                <li>You can view your booking details in "My Bookings" section</li>
                                            </ul>
                                        </div>
                                    }
                                    type="info"
                                    showIcon
                                />
                            </Card>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Failed payment case
    return (
        <>
            <Navbar />
            <div className="container my-5 py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <Result
                            status="error"
                            title="Payment Failed"
                            subTitle={verificationResult?.message || "Your payment was not successful. Please try again."}
                            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                            extra={[
                                <Button type="primary" key="retry" onClick={handleTryAgain}>
                                    Try Again
                                </Button>,
                                <Button key="events" onClick={() => navigate('/events')}>
                                    Browse Other Events
                                </Button>,
                            ]}
                        />
                        
                        {/* Payment Details Card for failed payments */}
                        {verificationResult?.booking && (
                            <Card 
                                title="Payment Information"
                                className="mt-4"
                            >
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Payment Reference">
                                        <code>{formatPaymentReference(verificationResult.booking.reference)}</code>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Amount">
                                        ₦{(verificationResult.booking.amount || 0).toLocaleString()}
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Status">
                                        <span className="badge bg-danger">Failed</span>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Time">
                                        {moment().format('MMM D, YYYY [at] h:mm A')}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}
                        
                        <Card className="mt-4">
                            <Alert
                                message="Need Help?"
                                description={
                                    <div>
                                        <p>If you're experiencing issues with payment, please:</p>
                                        <ul className="mb-0">
                                            <li>Check your internet connection and try again</li>
                                            <li>Ensure your card has sufficient funds</li>
                                            <li>Contact your bank if the issue persists</li>
                                            <li>Reach out to our support team for assistance</li>
                                        </ul>
                                    </div>
                                }
                                type="warning"
                                showIcon
                            />
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}