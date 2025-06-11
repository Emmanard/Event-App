import React, { useState, useEffect } from "react";
import BookmarkAddTwoToneIcon from "@mui/icons-material/BookmarkAddTwoTone";
import AssignmentIndTwoToneIcon from "@mui/icons-material/AssignmentIndTwoTone";
import { Avatar, Input, InputNumber, message, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  bookEvent,
  cancelBooking,
  checkBookingStatus,
  getBookingInfo,
  isEventBookable
} from "../../../services/event/index.js"

export default function RightCol({ event, user }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    quantity: 1
  });
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);

  const formatNumber = (num) => {
    num = num ? num : 0;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Check booking status on component mount
  useEffect(() => {
    const checkInitialBookingStatus = async () => {
      if (!event?._id || !user) {
        setBookingLoading(false);
        return;
      }

      try {
        const response = await checkBookingStatus(event._id);
        setIsBooked(response.data?.isBooked || false);
      } catch (error) {
        console.error("Error checking booking status:", error);
      } finally {
        setBookingLoading(false);
      }
    };

    checkInitialBookingStatus();
  }, [event?._id, user]);

  // Calculate booking info whenever event or booking status changes
  useEffect(() => {
    if (event) {
      const info = getBookingInfo(event, isBooked);
      setBookingInfo(info);
    }
  }, [event, isBooked]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { fullName, email, phone, quantity } = formData;
    
    if (!fullName.trim()) {
      message.error("Please enter your full name");
      return false;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      message.error("Please enter a valid email address");
      return false;
    }
    
    if (!phone || phone.toString().length < 10) {
      message.error("Please enter a valid phone number");
      return false;
    }
    
    if (!quantity || quantity < 1) {
      message.error("Please enter a valid quantity");
      return false;
    }

    if (bookingInfo && quantity > bookingInfo.availableSeats) {
      message.error(`Only ${bookingInfo.availableSeats} seats available`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      message.error("Please login to book this event");
      return;
    }

    if (!event?._id) {
      message.error("Event information not available");
      return;
    }

    // Handle cancel booking
    if (isBooked) {
      try {
        setLoading(true);
        await cancelBooking(event._id);
        setIsBooked(false);
        message.success("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        message.error(error.response?.data?.message || "Failed to cancel booking");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle new booking
    if (!validateForm()) return;

    if (!isEventBookable(event)) {
      message.error("This event is not available for booking");
      return;
    }

    try {
      setLoading(true);
      
      // Use bookEvent API with form data
      const bookingData = {
        ...formData,
        quantity: parseInt(formData.quantity)
      };

      await bookEvent(event._id, bookingData);
      
      setIsBooked(true);
      message.success("Event booked successfully!");
      
      // Reset form except user data
      setFormData(prev => ({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        quantity: 1
      }));
      
    } catch (error) {
      console.error("Error booking event:", error);
      message.error(error.response?.data?.message || "Failed to book event");
    } finally {
      setLoading(false);
    }
  };

  const renderBookingStatus = () => {
    if (bookingLoading) {
      return <Spin size="small" />;
    }

    if (!bookingInfo) return null;

    return (
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted">Available Seats:</span>
          <span className={`fw-bold ${bookingInfo.availableSeats === 0 ? 'text-danger' : 'text-success'}`}>
            {bookingInfo.availableSeats} / {bookingInfo.totalSeats}
          </span>
        </div>
        {bookingInfo.isNearlyFull && !bookingInfo.isFullyBooked && (
          <div className="text-warning small">
            <i className="fas fa-exclamation-triangle me-1"></i>
            Only {bookingInfo.availableSeats} seats left!
          </div>
        )}
        {isBooked && (
          <div className="text-success small">
            <i className="fas fa-check-circle me-1"></i>
            You have booked this event
          </div>
        )}
      </div>
    );
  };

  const getButtonProps = () => {
    if (!user) {
      return {
        disabled: true,
        className: "button-stylling w-100 py-3 rounded bg-secondary border-0",
        text: "Login Required"
      };
    }

    if (!bookingInfo) {
      return {
        disabled: true,
        className: "button-stylling w-100 py-3 rounded bg-secondary border-0",
        text: "Loading..."
      };
    }

    if (isBooked) {
      return {
        disabled: loading,
        className: "button-stylling w-100 py-3 rounded bg-danger border-0",
        text: loading ? "Cancelling..." : "Cancel Booking"
      };
    }

    if (bookingInfo.isFullyBooked) {
      return {
        disabled: true,
        className: "button-stylling w-100 py-3 rounded bg-secondary border-0",
        text: "Fully Booked"
      };
    }

    if (!isEventBookable(event)) {
      return {
        disabled: true,
        className: "button-stylling w-100 py-3 rounded bg-secondary border-0",
        text: "Not Available"
      };
    }

    return {
      disabled: loading,
      className: "button-stylling w-100 py-3 rounded bg-info border-0",
      text: loading ? "Booking..." : "Book Now"
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div style={{ position: "sticky", top: 90 }}>
      <div className="card border-0 shadow py-4 rounded-4">
        <div className="row mx-0">
          <div className="col-9 col-sm-7 col-md-12 col-lg-9 col-xl-7 bg-warning py-2 rounded-end d-flex justify-content-center">
            <h5 className="fw-bold text-light d-flex align-items-center">
              <BookmarkAddTwoToneIcon />{" "}
              <span className="ms-2">Book This Event</span>
            </h5>
          </div>
        </div>
        <div className="container mt-4">
          {renderBookingStatus()}
          
          <form onSubmit={handleSubmit}>
            <div className="row row-cols-1 px-2 px-sm-3 px-md-1 px-lg-3 g-3">
              <div className="col">
                <Input
                  size="large"
                  placeholder="Enter Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={loading || !user}
                  required
                />
              </div>
              <div className="col">
                <Input
                  size="large"
                  type="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading || !user}
                  required
                />
              </div>
              <div className="col">
                <InputNumber
                  size="large"
                  className="w-100"
                  placeholder="Enter Phone"
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  disabled={loading || !user}
                  required
                />
              </div>
              {!isBooked && (
                <div className="col">
                  <InputNumber
                    size="large"
                    className="w-100"
                    placeholder="Quantity"
                    min={1}
                    max={bookingInfo?.availableSeats || 10}
                    value={formData.quantity}
                    onChange={(value) => handleInputChange('quantity', value)}
                    disabled={loading || !user || bookingInfo?.isFullyBooked}
                    required
                  />
                  {bookingInfo && (
                    <small className="text-muted">
                      Max: {Math.min(10, bookingInfo.availableSeats)} tickets
                    </small>
                  )}
                </div>
              )}
              <div className="col">
                <button
                  className={buttonProps.className}
                  type="submit"
                  disabled={buttonProps.disabled}
                >
                  <span className="text">{buttonProps.text}</span>
                  <span>{isBooked ? "Cancel" : "Book Ticket"}</span>
                </button>
              </div>
            </div>
          </form>

          {!user && (
            <div className="text-center mt-3">
              <Link to="/login" className="text-info">
                Login to book this event
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* added by */}
      <div className="card border-0 shadow rounded-4 py-4 mt-4">
        <div className="row mx-0">
          <div className="col-7 col-sm-6 col-md-10 col-lg-9 col-xl-6 bg-warning py-2 rounded-end d-flex justify-content-center">
            <h5 className="fw-bold text-light d-flex align-items-center">
              <AssignmentIndTwoToneIcon />{" "}
              <span className="ms-2">Added By</span>
            </h5>
          </div>
        </div>
        <div className="container mt-4">
          <div className="text-center my-4">
            <Link to={`/profile/${event?.addedBy?._id || '#'}`}>
              <Avatar
                shape="square"
                size={100}
                src={event?.addedBy?.image}
                icon={<UserOutlined />}
              />
            </Link>
          </div>
          <div className="row mb-3">
            <div className="col">
              Followers: {formatNumber(event?.addedBy?.followers?.length)}
            </div>
            <div className="col">
              Following: {formatNumber(event?.addedBy?.following?.length)}
            </div>
          </div>
          <div>
            {event?.addedBy?.fullName && event?.addedBy?.fullName !== "" && (
              <>
                <h6 className="text-warning">Full Name</h6>
                <p>{event?.addedBy?.fullName}</p>
              </>
            )}

            {event?.addedBy?.profession &&
              event?.addedBy?.profession !== "" && (
                <>
                  <h6 className="text-warning">Profession</h6>
                  <p>{event?.addedBy?.profession}</p>
                </>
              )}

            {event?.addedBy?.email && event?.addedBy?.email !== "" && (
              <>
                <h6 className="text-warning">Email</h6>
                <p>{event?.addedBy?.email}</p>
              </>
            )}

            {event?.addedBy?.phone && event?.addedBy?.phone !== "" && (
              <>
                <h6 className="text-warning">Phone</h6>
                <p>{event?.addedBy?.phone}</p>
              </>
            )}

            {event?.addedBy?.country && event?.addedBy?.country !== "" && (
              <>
                <h6 className="text-warning">Country</h6>
                <p>{event?.addedBy?.country}</p>
              </>
            )}

            {event?.addedBy?.city && event?.addedBy?.city !== "" && (
              <>
                <h6 className="text-warning">City</h6>
                <p>{event?.addedBy?.city}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}