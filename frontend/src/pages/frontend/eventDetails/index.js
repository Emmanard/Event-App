import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import "./_eventDetails.scss";
import {
  addView,
  getEvent,
  cancelBooking,
  checkBookingStatus,
  getBookingInfo,
  getBookingStatusText,
  getBookingButtonText,
  getBookingButtonClass,
  bookEventWithPayment,
  validatePaymentData,
  calculateTotalCost,
  formatPaymentReference,
  getPaymentStatusInfo,
  isEventBookable,
} from "services/event";
import Banner from "components/background/Banner";
import moment from "moment";
import noData from "assets/gifs/noData.gif";

import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import VisibilityTwoToneIcon from "@mui/icons-material/VisibilityTwoTone";
import ChatBubbleTwoToneIcon from "@mui/icons-material/ChatBubbleTwoTone";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import {
  Modal,
  Progress,
  Form,
  Input,
  InputNumber,
  Alert,
  Steps,
  Card,
} from "antd";
import RightCol from "./RightCol";
import Comments from "./Comments";
import LoadingIndicator from "components/LoadingIndicator";
import { useAuthContext } from "context/AuthContext";

const { Step } = Steps;

export default function Index() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [event, setEvent] = useState({});
  const [bookingStatus, setBookingStatus] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    quantity: 1,
  });
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const hasAddedView = useRef(false);
  const { user } = useAuthContext();
  const commentRef = useRef(null);
  const [form] = Form.useForm();

  useEffect(() => {
    getEventData();
    addViewToEvent();
    if (user?._id) {
      checkUserBookingStatus();
      setBookingData((prev) => ({
        ...prev,
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const addViewToEvent = async () => {
    if (hasAddedView.current) {
      return;
    }
    hasAddedView.current = true;

    try {
      await addView(id);
    } catch (error) {
      console.log("Error adding view:", error);
    }
  };

  const getEventData = async () => {
    try {
      let { data } = await getEvent(id);
      setEvent(data?.data);
    } catch (error) {
      console.log(error);
      let msg = "Some error occurred";
      let { status, data } = error?.response;
      if (
        status == 400 ||
        status == 401 ||
        status == 500 ||
        status == 413 ||
        status == 404
      ) {
        msg = data.message || data.msg;
        if (window.toastify) {
          window.toastify(msg, "error");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserBookingStatus = async () => {
    try {
      const { data } = await checkBookingStatus(id);
      setBookingStatus(data?.data);
    } catch (error) {
      console.log("Error checking booking status:", error);
    }
  };

  const formatNumber = (num) => {
    num = num ? num : 0;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleBookingDataChange = (field, value) => {
    setBookingData((prev) => ({
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

  const validateBookingForm = () => {
    const validation = validatePaymentData(bookingData, event);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };
  
 const handlePaymentBooking = async () => {
  console.log("🔍 PAYMENT BOOKING DEBUG:");
  console.log("User:", user);
  console.log("Booking data:", bookingData);

  if (!user?._id) {
    if (window.toastify) {
      window.toastify("Please login to book this event", "warning");
    }
    return;
  }

  if (!validateBookingForm()) {
    if (window.toastify) {
      window.toastify("Please fix the form errors", "error");
    }
    return;
  }

  setBookingLoading(true);

  try {
    console.log("📤 Initiating payment booking...");
    const response = await bookEventWithPayment(id, bookingData);
    
    console.log("✅ Payment response:", response);

    // FIXED: Access data directly from response since bookEventWithPayment already processes it
    if (response.success && response.paymentUrl) {
      setPaymentInfo({
        authorization_url: response.paymentUrl,
        reference: response.reference,
        amount: response.amount
      });
      setPaymentStep(1);
      window.location.href = response.paymentUrl;
    } else {
      throw new Error("Failed to initialize payment");
    }
  } catch (error) {
    console.log("❌ Payment booking error:", error);
    let msg = "Payment initialization failed";
    if (error?.response?.data?.message || error?.response?.data?.msg) {
      msg = error.response.data.message || error.response.data.msg;
    } else if (error.message) {
      msg = error.message;
    }

    if (window.toastify) {
      window.toastify(msg, "error");
    }
  } finally {
    setBookingLoading(false);
  }
};
  const handleBookingClick = () => {
    if (!user?._id) {
      if (window.toastify) {
        window.toastify("Please login to book this event", "warning");
      }
      return;
    }

    if (!isEventBookable(event)) {
      if (window.toastify) {
        window.toastify("This event is not available for booking", "error");
      }
      return;
    }

    const bookingInfo = getBookingInfo(event, bookingStatus?.isBooked);

    if (bookingInfo.isBooked) {
      setShowBookingModal(true);
    } else {
      setShowPaymentModal(true);
      setPaymentStep(0);
    }
  };

  const confirmBookingCancellation = async () => {
    setShowBookingModal(false);
    setBookingLoading(true);

    try {
      console.log("📤 Cancelling booking...");
      const { data } = await cancelBooking(id);

      if (window.toastify) {
        window.toastify(
          data?.msg || "Booking cancelled successfully",
          "success"
        );
      }
      setBookingStatus({ isBooked: false });
      getEventData();
    } catch (error) {
      console.log("❌ Booking cancellation error:", error);
      let msg = "Some error occurred";
      let { status, data } = error?.response || {};
      if (
        status === 400 ||
        status === 401 ||
        status === 500 ||
        status === 413 ||
        status === 404
      ) {
        msg = data?.message || data?.msg || msg;
      }
      if (window.toastify) {
        window.toastify(msg, "error");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setPaymentStep(0);
    setPaymentInfo(null);
    setValidationErrors({});
    form.resetFields();
  };

  const ticketPrice = parseFloat(event?.ticketPrice || 0);
  const costBreakdown = calculateTotalCost(ticketPrice, bookingData.quantity);
  const bookingInfo = getBookingInfo(event, bookingStatus?.isBooked);
  const isPaidEvent = ticketPrice > 0;

  return (
    <>
      <Navbar />
      <LoadingIndicator loading={loading} />

      <Banner
        title={"ALL YOU NEED TO KNOW"}
        pageTitle={"Event Details"}
        page={"Details"}
      />

      <div className="container my-5 pt-2 pt-md-5" id="event-details">
        <div className="row">
          <div className="col-12 col-md-8">
            {isLoading ? (
              <div className="my-5 text-center">
                <div className="spinner-grow spinner-grow-sm bg-info"></div>
                <div className="spinner-grow spinner-grow-sm bg-warning mx-3"></div>
                <div className="spinner-grow spinner-grow-sm bg-info"></div>
              </div>
            ) : (
              <>
                {event?.status === "Draft" ? (
                  <div className="row">
                    <div className="col my-4 text-center">
                      <img
                        src={noData}
                        alt="no data found"
                        className="img-fluid"
                      />
                      <h5 className="mt-4 text-warning text-center">
                        Sorry, the event you are trying to access is currently
                        not available.
                      </h5>
                    </div>
                  </div>
                ) : event?.status === "Closed" ? (
                  <div className="row">
                    <div className="col my-4 text-center">
                      <img
                        src={noData}
                        alt="no data found"
                        className="img-fluid"
                      />
                      <h5 className="mt-4 text-warning text-center">
                        Sorry, the event you are trying to access is not
                        available because event is closed.
                      </h5>
                    </div>
                  </div>
                ) : event?.status === "Deleted" ? (
                  <div className="row">
                    <div className="col my-4 text-center">
                      <img
                        src={noData}
                        alt="no data found"
                        className="img-fluid"
                      />
                      <h5 className="mt-4 text-warning ">
                        Sorry, the event you are trying to access is not
                        available. The event organizer cancelled the event.
                      </h5>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <img
                        className="img-fluid rounded"
                        width={"100%"}
                        src={event?.image}
                        alt={event?.title}
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center my-4">
                      <div style={{ width: "50%" }}>
                        <i className="bx bx-calendar text-warning me-1"></i>
                        <small>
                          {moment(event?.date).format("MMM D, YYYY")}
                        </small>
                      </div>
                      <div style={{ width: "50%", textAlign: "end" }}>
                        <LocationOnOutlinedIcon
                          fontSize="small"
                          className="text-warning me-1"
                        />
                        <small>
                          {event?.country}, {event?.city}
                        </small>
                      </div>
                    </div>
                    <hr />

                    {event?.status === "Published" && (
                      <div className="booking-status-section mb-4">
                        <div className="row">
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <div className="row align-items-center">
                                  <div className="col-md-6">
                                    <h6 className="mb-2">
                                      <EventSeatIcon className="text-primary me-2" />
                                      Booking Status
                                    </h6>
                                    <div className="mb-2">
                                      <Progress
                                        percent={bookingInfo.bookingPercentage}
                                        strokeColor={
                                          bookingInfo.isFullyBooked
                                            ? "#ff4d4f"
                                            : bookingInfo.isNearlyFull
                                            ? "#faad14"
                                            : "#52c41a"
                                        }
                                        size="small"
                                      />
                                    </div>
                                    <small className="text-muted">
                                      {getBookingStatusText(bookingInfo)}
                                    </small>
                                  </div>
                                  <div className="col-md-6 text-md-end">
                                    <div className="mb-3">
                                      <h5 className="text-primary mb-0">
                                        {isPaidEvent
                                          ? `₦${ticketPrice.toLocaleString()}`
                                          : "FREE"}
                                      </h5>
                                      <small className="text-muted">
                                        per ticket
                                      </small>
                                    </div>
                                    <button
                                      className={`btn ${getBookingButtonClass(
                                        bookingInfo
                                      )} px-4`}
                                      onClick={handleBookingClick}
                                      disabled={
                                        bookingLoading ||
                                        bookingInfo.isFullyBooked
                                      }
                                    >
                                      {bookingLoading ? (
                                        <>
                                          <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                          ></span>
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          {isPaidEvent &&
                                            !bookingInfo.isBooked && (
                                              <PaymentIcon
                                                fontSize="small"
                                                className="me-2"
                                              />
                                            )}
                                          {getBookingButtonText(bookingInfo)}
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between my-4">
                      <button
                        style={{ width: "24%" }}
                        className="btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center"
                      >
                        <VisibilityTwoToneIcon
                          className="text-secondary"
                          fontSize="small"
                        />
                        <small className="ms-2">
                          {formatNumber(event?.views?.length)} Views
                        </small>
                      </button>

                      <button
                        style={{ width: "24%" }}
                        onClick={() =>
                          commentRef.current.scrollIntoView({
                            behavior: "smooth",
                          })
                        }
                        className="btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center"
                      >
                        <ChatBubbleTwoToneIcon
                          className="text-primary"
                          fontSize="small"
                        />
                        <small className="ms-2">
                          {formatNumber(event?.comments?.length)} Comments
                        </small>
                      </button>
                      <button
                        style={{ width: "24%" }}
                        className="btn btn-light d-flex justify-content-center flex-column flex-sm-row align-items-center"
                      >
                        <EventSeatIcon
                          className="text-success"
                          fontSize="small"
                        />
                        <small className="ms-2">
                          {bookingInfo.availableSeats} Seats
                        </small>
                      </button>
                    </div>
                    <hr />

                    <div>
                      <h3 className="mt-4 fw-bold">{event?.title}</h3>
                      <div className="d-flex justify-content-between">
                        <h6 className="text-warning mt-3 mb-5">
                          <span className="text-dark">Seats Left: </span>
                          {bookingInfo.availableSeats}
                        </h6>
                        <h6 className="text-primary mt-3 mb-3 text-end">
                          <span className="text-dark">Ticket Price: </span>
                          {isPaidEvent
                            ? `₦${ticketPrice.toLocaleString()}`
                            : "FREE"}
                        </h6>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="col-12 col-md-4 mt-4 mt-md-0">
            <RightCol event={event} user={user} />
          </div>
        </div>
        {event?.status === "Published" && (
          <div className="row">
            <div className="col-12 col-md-8" ref={commentRef}>
              <Comments id={id} getEventData={getEventData} />
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Confirm Booking Cancellation"
        open={showBookingModal}
        onOk={confirmBookingCancellation}
        onCancel={() => setShowBookingModal(false)}
        okText="Yes, Cancel Booking"
        cancelText="No, Keep Booking"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to cancel your booking for this event?</p>
        <p className="text-muted">
          <strong>Event:</strong> {event?.title}
          <br />
          <strong>Date:</strong> {moment(event?.date).format("MMM D, YYYY")}
          <br />
          <strong>Ticket Price:</strong>{" "}
          {isPaidEvent ? `₦${ticketPrice.toLocaleString()}` : "FREE"}
        </p>
      </Modal>

      <Modal
        title={
          <div className="d-flex align-items-center">
            <PaymentIcon className="me-2" />
            Book Event - {event?.title}
          </div>
        }
        open={showPaymentModal}
        onCancel={handlePaymentModalClose}
        footer={null}
        width={600}
      >
        <Steps current={paymentStep} className="mb-4">
          <Step title="Booking Details" icon={<PersonIcon />} />
          <Step title="Payment" icon={<PaymentIcon />} />
        </Steps>

        {paymentStep === 0 && (
          <div>
            <Alert
              message="Complete your booking details"
              description="Please provide your information for ticket booking and payment processing."
              type="info"
              showIcon
              className="mb-4"
            />

            <Form form={form} layout="vertical" initialValues={bookingData}>
              <Form.Item
                label="Full Name"
                validateStatus={validationErrors.fullName ? "error" : ""}
                help={validationErrors.fullName}
              >
                <Input
                  prefix={<PersonIcon />}
                  placeholder="Enter your full name"
                  value={bookingData.fullName}
                  onChange={(e) =>
                    handleBookingDataChange("fullName", e.target.value)
                  }
                />
              </Form.Item>

              <Form.Item
                label="Email Address"
                validateStatus={validationErrors.email ? "error" : ""}
                help={validationErrors.email}
              >
                <Input
                  prefix={<EmailIcon />}
                  type="email"
                  placeholder="Enter your email address"
                  value={bookingData.email}
                  onChange={(e) =>
                    handleBookingDataChange("email", e.target.value)
                  }
                />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                validateStatus={validationErrors.phone ? "error" : ""}
                help={validationErrors.phone}
              >
                <Input
                  prefix={<PhoneIcon />}
                  placeholder="Enter your phone number"
                  value={bookingData.phone}
                  onChange={(e) =>
                    handleBookingDataChange("phone", e.target.value)
                  }
                />
              </Form.Item>

              <Form.Item
                label="Number of Tickets"
                validateStatus={validationErrors.quantity ? "error" : ""}
                help={validationErrors.quantity}
              >
                <InputNumber
                  min={1}
                  max={Math.min(5, bookingInfo.availableSeats)}
                  value={bookingData.quantity}
                  onChange={(value) =>
                    handleBookingDataChange("quantity", value)
                  }
                  style={{ width: "100%" }}
                  prefix={<ConfirmationNumberIcon />}
                />
              </Form.Item>
            </Form>

            <Card className="mb-4" size="small">
              <div className="d-flex justify-content-between mb-2">
                <span>Ticket Price (x{bookingData.quantity}):</span>
                <strong>₦{costBreakdown.subtotal.toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Processing Fee:</span>
                <span>₦{costBreakdown.processingFee.toLocaleString()}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between">
                <strong>Total Amount:</strong>
                <strong className="text-primary">
                  ₦{costBreakdown.totalAmount.toLocaleString()}
                </strong>
              </div>
            </Card>

            <div className="text-end">
              <button
                className="btn btn-secondary me-2"
                onClick={handlePaymentModalClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePaymentBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <PaymentIcon className="me-2" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {paymentStep === 1 && paymentInfo && (
          <div className="text-center">
            <Alert
              message="Redirecting to Payment"
              description="You will be redirected to Paystack to complete your payment."
              type="success"
              showIcon
              className="mb-4"
            />

            <div className="mb-4">
              <h5>
                Payment Reference:{" "}
                {formatPaymentReference(paymentInfo.reference)}
              </h5>
              <p className="text-muted">
                Amount: ₦{paymentInfo.amount?.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>
      <Footer />
    </>
  );
}