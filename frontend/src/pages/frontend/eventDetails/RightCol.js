import React, { useState, useEffect } from "react";
import BookmarkAddTwoToneIcon from "@mui/icons-material/BookmarkAddTwoTone";
import AssignmentIndTwoToneIcon from "@mui/icons-material/AssignmentIndTwoTone";
import { Avatar, Input, InputNumber, message, Spin, Alert } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  cancelBooking,
  checkBookingStatus,
  getBookingInfo,
  // isEventBookable, // <-- Commented out
  bookEventWithPayment,
  calculateTotalCost,
  validatePaymentData,
} from "../../../services/event/index.js";

export default function RightCol({ event, user }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (event?.ticketPrice) {
      const cost = calculateTotalCost(
        parseFloat(event.ticketPrice),
        formData.quantity
      );
      setCostBreakdown(cost);
    }
  }, [event, formData.quantity]);

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

  useEffect(() => {
    if (event) {
      const info = getBookingInfo(event, isBooked);
      setBookingInfo(info);
    }
  }, [event, isBooked]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const validationData = {
      ...formData,
      phone: String(formData.phone || ""),
    };
    const validation = validatePaymentData(validationData, event);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      message.error(firstError);
    }

    return validation.isValid;
  };

  const handlePaidEventBooking = async () => {
  try {
    setLoading(true);
    const isFormValid = validateForm();
    if (!isFormValid) {
      setLoading(false);
      return;
    }
    
    const validatedBookingData = {
      ...formData,
      phone: String(formData.phone || ''), 
      quantity: parseInt(formData.quantity, 10),
    };

    // FIXED: bookEventWithPayment already returns the processed response
    const response = await bookEventWithPayment(event._id, validatedBookingData);

    console.log("✅ Payment response:", response);

    // FIXED: Access data directly from response since bookEventWithPayment already processes it
    if (response.success && response.paymentUrl) {
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({
          reference: response.reference,
          eventId: event._id,
          eventTitle: response.eventTitle,
          amount: response.amount,
          timestamp: Date.now(),
        })
      );

      message.success("Redirecting to payment...", 2);

      setTimeout(() => {
        window.location.href = response.paymentUrl;
      }, 1500);
    } else {
      // Handle cases where the server sends an unsuccessful response
      throw new Error(response.message || "Failed to initialize payment");
    }
  } catch (error) {
    console.error("Error initializing payment:", error);
    // Handle errors from the server
    const errorMessage = error.response?.data?.message || error.message || "Failed to initialize payment";
    message.error(errorMessage);
  } finally {
    setLoading(false);
  }
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

    if (isBooked) {
      try {
        setLoading(true);
        await cancelBooking(event._id);
        setIsBooked(false);
        message.success("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        message.error(
          error.response?.data?.message || "Failed to cancel booking"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // if (!isEventBookable(event)) { // <-- Commented out this check
    //   message.error("This event is not available for booking");
    //   return;
    // }
    
    await handlePaidEventBooking();
  };

  const renderCostBreakdown = () => {
    if (!costBreakdown || !event?.ticketPrice) return null;

    return (
      <div className="mb-3">
        <div className="card bg-light border-0">
          <div className="card-body p-3">
            <h6 className="card-title mb-2 text-info">
              <i className="fas fa-receipt me-2"></i>
              Cost Breakdown
            </h6>
            <div className="d-flex justify-content-between mb-1">
              <span>
                Ticket Price × {formData.quantity}:
              </span>
              <span>{formatCurrency(costBreakdown.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Processing Fee (1.5%):</span>
              <span className="text-muted">
                {formatCurrency(costBreakdown.processingFee)}
              </span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total Amount:</span>
              <span className="text-primary fs-5">
                {formatCurrency(costBreakdown.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
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
          <span
            className={`fw-bold ${
              bookingInfo.availableSeats === 0 ? "text-danger" : "text-success"
            }`}
          >
            {bookingInfo.availableSeats} / {bookingInfo.totalSeats}
          </span>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="text-muted">Ticket Price:</span>
          <span className="fw-bold text-success fs-6">
            {formatCurrency(event?.ticketPrice || 0)}
          </span>
        </div>

        {bookingInfo.isNearlyFull && !bookingInfo.isFullyBooked && (
          <Alert
            message={`Only ${bookingInfo.availableSeats} seats left!`}
            type="warning"
            showIcon
            className="mt-2"
            size="small"
          />
        )}

        {isBooked && (
          <Alert
            message="You have booked this event"
            type="success"
            showIcon
            className="mt-2"
            size="small"
          />
        )}

        <Alert
          message={
            <span>
              🔒 Secure payment powered by <strong>Paystack</strong>
            </span>
          }
          type="info"
          showIcon
          className="mt-2"
          size="small"
        />
      </div>
    );
  };

  const getButtonProps = () => {
    if (!user) {
      return {
        disabled: true,
        className: "button-stylling w-100 py-3 rounded bg-secondary border-0",
        text: "Login Required",
      };
    }

    if (!bookingInfo) {
      return {
        disabled: true,
        className: "button-stylling w-100 py-3 rounded bg-secondary border-0",
        text: "Loading...",
      };
    }

    if (isBooked) {
      return {
        disabled: loading,
        className: "button-stylling w-100 py-3 rounded bg-danger border-0",
        text: loading ? "Cancelling..." : "Cancel Booking",
      };
    }

    if (bookingInfo.isFullyBooked) {
      return {
        disabled: true,
        className: "button-stylling w-100 py-3 rounded bg-secondary border-0",
        text: "Fully Booked",
      };
    }

    // if (!isEventBookable(event)) { // <-- Commented out this check
    //   return {
    //     disabled: true,
    //     className: "button-stylling w-100 py-3 rounded bg-secondary border-0",
    //     text: "Not Available",
    //   };
    // }

    return {
      disabled: loading,
      className: "button-stylling w-100 py-3 rounded bg-warning border-0",
      text: loading
        ? "Processing..."
        : `Pay ${
            costBreakdown ? formatCurrency(costBreakdown.totalAmount) : "Now"
          }`,
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div style={{ position: "sticky", top: 90 }}>
      <div className="card border-0 shadow py-4 rounded-4">
        <div className="row mx-0">
          <div className="col-9 col-sm-7 col-md-12 col-lg-9 col-xl-7 bg-warning py-2 rounded-end d-flex justify-content-center">
            <h5 className="fw-bold text-light d-flex align-items-center">
              <BookmarkAddTwoToneIcon /> <span className="ms-2">Buy Tickets</span>
            </h5>
          </div>
        </div>
        <div className="container mt-4">
          {renderBookingStatus()}
          {renderCostBreakdown()}

          <form onSubmit={handleSubmit}>
            <div className="row row-cols-1 px-2 px-sm-3 px-md-1 px-lg-3 g-3">
              <div className="col">
                <Input
                  size="large"
                  placeholder="Enter Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  disabled={loading || !user}
                  status={validationErrors.fullName ? "error" : ""}
                  required
                />
                {validationErrors.fullName && (
                  <small className="text-danger">
                    {validationErrors.fullName}
                  </small>
                )}
              </div>

              <div className="col">
                <Input
                  size="large"
                  type="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={loading || !user}
                  status={validationErrors.email ? "error" : ""}
                  required
                />
                {validationErrors.email && (
                  <small className="text-danger">
                    {validationErrors.email}
                  </small>
                )}
              </div>

              <div className="col">
                <InputNumber
                  size="large"
                  className="w-100"
                  placeholder="Enter Phone"
                  value={formData.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  disabled={loading || !user}
                  status={validationErrors.phone ? "error" : ""}
                  required
                />
                {validationErrors.phone && (
                  <small className="text-danger">
                    {validationErrors.phone}
                  </small>
                )}
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
                    onChange={(value) => handleInputChange("quantity", value)}
                    disabled={loading || !user || bookingInfo?.isFullyBooked}
                    status={validationErrors.quantity ? "error" : ""}
                    required
                  />
                  {validationErrors.quantity ? (
                    <small className="text-danger">
                      {validationErrors.quantity}
                    </small>
                  ) : (
                    bookingInfo && (
                      <small className="text-muted">
                        Max: {Math.min(10, bookingInfo.availableSeats)} tickets
                      </small>
                    )
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
                  <span>{isBooked ? "Cancel" : "Buy Tickets"}</span>
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

          <div className="mt-3 text-center">
            <small className="text-muted d-block">
              <i className="fas fa-shield-alt me-1"></i>
              Secure payment powered by Paystack
            </small>
            <small className="text-muted">
              <i className="fas fa-credit-card me-1"></i>
              Cards • Bank Transfer • USSD • Mobile Money
            </small>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow rounded-4 py-4 mt-4">
        <div className="row mx-0">
          <div className="col-7 col-sm-6 col-md-10 col-lg-9 col-xl-6 bg-warning py-2 rounded-end d-flex justify-content-center">
            <h5 className="fw-bold text-light d-flex align-items-center">
              <AssignmentIndTwoToneIcon /> <span className="ms-2">Added By</span>
            </h5>
          </div>
        </div>
        <div className="container mt-4">
          <div className="text-center my-4">
            <Link to={`/profile/${event?.addedBy?._id || "#"}`}>
              <Avatar
                shape="square"
                size={100}
                src={event?.addedBy?.image}
                icon={<UserOutlined />}
              />
            </Link>
          </div>
          <div className="row mb-3"></div>
          <div>
            {event?.addedBy?.fullName && event?.addedBy?.fullName !== "" && (
              <>
                <h6 className="text-warning">Full Name</h6>
                <p>{event?.addedBy?.fullName}</p>
              </>
            )}

            {event?.addedBy?.profession && event?.addedBy?.profession !== "" && (
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