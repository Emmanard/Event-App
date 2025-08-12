import { post, get, del, put } from "services/http";
const root = process.env.REACT_APP_EVENT_WAVE_ROOT_URL;

// ================================
// EXISTING EVENT APIS (CORE CRUD)
// ================================

export const addEvent = (body) => {
  return post(`${root}/api/v1/event/add`, body);
};

export const getMyEvents = () => {
  return get(`${root}/api/v1/event/getMyEvents`);
};

export const delEvent = (id) => {
  return del(`${root}/api/v1/event?id=${id}`);
};

export const getEditEvent = (id) => {
  return get(`${root}/api/v1/event?id=${id}`);
};

export const getEvent = (id) => {
  return get(`${root}/api/v1/event?id=${id}`);
};

export const updateEvent = (id, body) => {
  return put(`${root}/api/v1/event?id=${id}`, body);
};

export const getPopularEvents = (type) => {
  return get(`${root}/api/v1/event/popular/${type}`);
};

// ================================
// NEW ROUTES FOR GET ALL EVENTS AND POPULAR EVENTS
// ================================

export const getAllEvents = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`${root}/api/v1/event/all${queryString ? `?${queryString}` : ""}`);
};

export const getPopularEventsAll = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return get(
    `${root}/api/v1/event/popular${queryString ? `?${queryString}` : ""}`
  );
};

export const getPopularEventsSimple = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return get(
    `${root}/api/v1/event/popular-simple${queryString ? `?${queryString}` : ""}`
  );
};

// ================================
// EVENT INTERACTIONS
// ================================

export const addView = (id) => {
  return put(`${root}/api/v1/event/addView?id=${id}`);
};

export const addLike = (id) => {
  return put(`${root}/api/v1/event/addLike?id=${id}`);
};

export const removeLike = (id) => {
  return put(`${root}/api/v1/event/removeLike?id=${id}`);
};

export const addComment = (id, body) => {
  return post(`${root}/api/v1/event/comment?id=${id}`, body);
};

export const getComments = (id, page) => {
  return get(`${root}/api/v1/event/comment?id=${id}&limit=10&page=${page}`);
};

export const deleteComment = (id) => {
  return del(`${root}/api/v1/event/comment?id=${id}`);
};

export const updateComment = (id, body) => {
  return put(`${root}/api/v1/event/comment/update?id=${id}`, body);
};

// ================================
// SEARCH AND DISCOVERY
// ================================

export const searchEvents = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`${root}/api/v1/event/search?${queryString}`);
};

export const advancedSearchEvents = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`${root}/api/v1/event/advanced-search?${queryString}`);
};

export const getEventsByCategory = (category, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "popular",
    dateFrom,
    dateTo,
    priceMin,
    priceMax,
    location,
  } = options;

  const params = new URLSearchParams({
    category,
    page,
    limit,
    sortBy,
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(priceMin && { priceMin }),
    ...(priceMax && { priceMax }),
    ...(location && { location }),
  });

  return get(`${root}/api/v1/event/category?${params.toString()}`);
};

export const getEventCategories = () => {
  return get(`${root}/api/v1/event/categories`);
};

export const getFeaturedEvents = (limit = 6) => {
  return get(`${root}/api/v1/event/featured?limit=${limit}`);
};

export const getUpcomingEvents = (limit = 10) => {
  return get(`${root}/api/v1/event/upcoming?limit=${limit}`);
};

// ================================
// USER INTERACTIONS
// ================================

export const reportEvent = (id, reason) => {
  return post(`${root}/api/v1/event/report?id=${id}`, { reason });
};

export const bookmarkEvent = (id) => {
  return put(`${root}/api/v1/event/bookmark?id=${id}`);
};

export const getBookmarkedEvents = () => {
  return get(`${root}/api/v1/event/bookmarks`);
};

export const shareEvent = (id, platform) => {
  return post(`${root}/api/v1/event/share?id=${id}`, { platform });
};

// ================================
// EVENT ATTENDANCE MANAGEMENT
// ================================

export const attendEvent = (id) => {
  return post(`${root}/api/v1/event/attend/${id}`);
};

export const unattendEvent = (id) => {
  return del(`${root}/api/v1/event/attend/${id}`);
};

export const getMyAttendedEvents = () => {
  return get(`${root}/api/v1/event/my-attended`);
};

// ================================
// ANALYTICS AND INSIGHTS
// ================================

export const getEventStats = (id) => {
  return get(`${root}/api/v1/event/stats?id=${id}`);
};

export const getEventAnalytics = (id) => {
  return get(`${root}/api/v1/event/analytics/${id}`);
};

// ================================
// PERSONALIZATION
// ================================

export const getEventRecommendations = (limit = 5) => {
  return get(`${root}/api/v1/event/recommendations?limit=${limit}`);
};

// ================================
// BULK OPERATIONS
// ================================

export const bulkEventOperations = (action, eventIds) => {
  return post(`${root}/api/v1/event/bulk`, { action, eventIds });
};

// ================================
// EVENT MANAGEMENT UTILITIES
// ================================

export const cloneEvent = (id) => {
  return post(`${root}/api/v1/event/clone/${id}`);
};

export const updateEventStatus = (id, status) => {
  return put(`${root}/api/v1/event/status/${id}`, { status });
};

// ================================
// EXISTING UTILITY FUNCTIONS
// ================================

// Advanced filtering and sorting utilities
export const filterEvents = (events, filters) => {
  return events.filter((event) => {
    // Date filter
    if (filters.dateRange && filters.dateRange !== "all") {
      const eventDate = new Date(event.date);
      const now = new Date();

      switch (filters.dateRange) {
        case "today":
          if (eventDate.toDateString() !== now.toDateString()) return false;
          break;
        case "tomorrow":
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (eventDate.toDateString() !== tomorrow.toDateString())
            return false;
          break;
        case "this-week":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          if (eventDate < weekStart || eventDate > weekEnd) return false;
          break;
        case "this-month":
          if (
            eventDate.getMonth() !== now.getMonth() ||
            eventDate.getFullYear() !== now.getFullYear()
          )
            return false;
          break;
        default:
          break;
      }
    }

    // Price filter
    if (filters.priceRange && filters.priceRange !== "all") {
      const price = parseFloat(event.price || 0);

      switch (filters.priceRange) {
        case "free":
          if (price > 0) return false;
          break;
        case "0-25":
          if (price > 25) return false;
          break;
        case "25-50":
          if (price < 25 || price > 50) return false;
          break;
        case "50-100":
          if (price < 50 || price > 100) return false;
          break;
        case "100+":
          if (price < 100) return false;
          break;
        default:
          break;
      }
    }

    // Location filter
    if (filters.location && filters.location !== "all") {
      if (
        !event.location ||
        !event.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });
};

export const sortEvents = (events, sortBy) => {
  const sortedEvents = [...events];

  switch (sortBy) {
    case "newest":
      return sortedEvents.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case "oldest":
      return sortedEvents.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    case "date-asc":
      return sortedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    case "date-desc":
      return sortedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    case "price-low":
      return sortedEvents.sort(
        (a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
      );
    case "price-high":
      return sortedEvents.sort(
        (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)
      );
    case "alphabetical":
      return sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
    case "views":
      return sortedEvents.sort(
        (a, b) => (b.views?.length || 0) - (a.views?.length || 0)
      );
    case "popular":
    default:
      return sortedEvents.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
  }
};

// Utility functions for event data processing
export const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  return {
    formatted: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    relative: getRelativeTimeString(date),
  };
};

export const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 7) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return date.toLocaleDateString();
};

export const calculateEventStat = (event) => {
  return {
    likes: event.likes?.length || 0,
    views: event.views?.length || 0,
    comments: event.comments?.length || 0,
    shares: event.shares?.length || 0,
    bookmarks: event.bookmarks?.length || 0,
  };
};

export const isEventLiked = (event, userId) => {
  return event.likes?.includes(userId) || false;
};

export const isEventBookmarked = (event, userId) => {
  return event.bookmarks?.includes(userId) || false;
};

// Event validation utilities
export const validateEventData = (eventData) => {
  const errors = {};

  if (!eventData.title?.trim()) {
    errors.title = "Event title is required";
  }

  if (!eventData.description?.trim()) {
    errors.description = "Event description is required";
  }

  if (!eventData.date) {
    errors.date = "Event date is required";
  } else if (new Date(eventData.date) < new Date()) {
    errors.date = "Event date cannot be in the past";
  }

  if (!eventData.category) {
    errors.category = "Event category is required";
  }

  if (eventData.price && isNaN(parseFloat(eventData.price))) {
    errors.price = "Price must be a valid number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Cache management for better performance
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const clearCache = () => {
  cache.clear();
};
// ================================
// EVENT BOOKING MANAGEMENT
// ================================

export const bookEvent = (id, formData = {}) => {
  // Enhanced booking route that supports both single and bulk booking with form data
  return post(`${root}/api/v1/event/book/${id}`, formData);
};

export const bookEventSingle = (id) => {
  // Legacy single booking route for backward compatibility
  return post(`${root}/api/v1/event/book-single/${id}`);
};

export const cancelBooking = (id) => {
  return del(`${root}/api/v1/event/book/${id}`);
};

export const getMyBookedEvents = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return get(
    `${root}/api/v1/event/my-bookings${queryString ? `?${queryString}` : ""}`
  );
};

export const checkBookingStatus = (id) => {
  return get(`${root}/api/v1/event/booking-status/${id}`);
};

export const getEventAttendees = (id) => {
  return get(`${root}/api/v1/event/attendees/${id}`);
};

// ================================
// PAYMENT ROUTES (ENHANCED)
// ================================

/**
 * Initialize Paystack payment for an event with full booking details
 * @param {string} eventId - Event ID
 * @param {object} paymentData - Payment and booking details
 * @param {number} paymentData.quantity - Number of tickets
 * @param {string} paymentData.fullName - Full name for booking
 * @param {string} paymentData.email - Email for payment and booking
 * @param {string} paymentData.phone - Phone number
 */
export const initializePayment = (eventId, paymentData) => {
  return post(`${root}/api/v1/payments/initialize/${eventId}`, paymentData);
};

/**
 * Verify Paystack payment and complete booking automatically
 * @param {string} reference - Payment reference from Paystack
 */
export const verifyPayment = (reference) => {
  return get(`${root}/api/v1/payments/verify/${reference}`);
};

/**
 * Get payment status using reference
 * @param {string} reference - Payment reference
 */
export const getPaymentStatus = (reference) => {
  return get(`${root}/api/v1/payments/status/${reference}`);
};

/**
 * Get user's complete payment history with event details
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by payment status
 */
export const getPaymentHistory = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`${root}/api/v1/payments/history${queryString ? `?${queryString}` : ""}`);
};

/**
 * Handle Paystack webhook (for internal use)
 * @param {object} webhookData - Webhook payload from Paystack
 */
export const handlePaymentWebhook = (webhookData) => {
  return post(`${root}/api/v1/payments/webhook`, webhookData);
};

// ================================
// PAYMENT UTILITY FUNCTIONS
// ================================

/**
 * Calculate total cost including processing fees
 * @param {number} ticketPrice - Base ticket price
 * @param {number} quantity - Number of tickets
 * @param {number} feePercentage - Processing fee percentage (default 1.5%)
 * @param {number} minimumFee - Minimum processing fee (default 100 kobo)
 */
export const calculateTotalCost = (ticketPrice, quantity = 1, feePercentage = 1.5, minimumFee = 100) => {
  const subtotal = ticketPrice * quantity;
  const processingFee = Math.max(subtotal * (feePercentage / 100), minimumFee);
  const totalAmount = subtotal + processingFee;
  
  return {
    subtotal,
    processingFee,
    totalAmount,
    breakdown: {
      ticketPrice,
      quantity,
      subtotal,
      processingFee,
      total: totalAmount
    }
  };
};

/**
 * Validate payment data before initialization
 * @param {object} paymentData - Payment data to validate
 * @param {object} event - Event data for validation
 */
export const validatePaymentData = (paymentData, event) => {
  const errors = {};
  
  // Required fields validation
  if (!paymentData.fullName?.trim()) {
    errors.fullName = "Full name is required for booking";
  }
  
  if (!paymentData.email?.trim()) {
    errors.email = "Email is required for payment";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  if (!paymentData.phone?.trim()) {
    errors.phone = "Phone number is required for booking";
  }
  
  if (!paymentData.quantity || paymentData.quantity < 1) {
    errors.quantity = "At least 1 ticket must be selected";
  }
  
  // Event-specific validations
  if (event) {
    const availableSeats = event.seats - (event.seatsBooked?.length || 0);
    
    if (paymentData.quantity > availableSeats) {
      errors.quantity = `Only ${availableSeats} seats available`;
    }
    
    // Check event status
    if (event.status !== 'Published') {
      errors.event = "Event is not available for booking";
    }
    
    // Check event date
    if (new Date(event.date) < new Date()) {
      errors.event = "Cannot book tickets for past events";
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format payment reference for display
 * @param {string} reference - Payment reference
 */
export const formatPaymentReference = (reference) => {
  if (!reference) return "";
  
  // EVT_1234567890_ABCD1234 -> EVT-1234...D1234
  const parts = reference.split('_');
  if (parts.length === 3) {
    const [prefix, timestamp, random] = parts;
    const shortTimestamp = timestamp.slice(-4);
    const shortRandom = random.slice(0, 4);
    return `${prefix}-${shortTimestamp}...${shortRandom}`;
  }
  
  return reference;
};

/**
 * Get payment status display info
 * @param {string} status - Payment status
 */
export const getPaymentStatusInfo = (status) => {
  const statusMap = {
    pending: {
      label: "Pending",
      color: "warning",
      icon: "clock",
      description: "Payment is being processed"
    },
    successful: {
      label: "Successful",
      color: "success",
      icon: "check-circle",
      description: "Payment completed successfully"
    },
    failed: {
      label: "Failed",
      color: "danger",
      icon: "x-circle",
      description: "Payment was not successful"
    },
    abandoned: {
      label: "Abandoned",
      color: "secondary",
      icon: "minus-circle",
      description: "Payment was not completed"
    }
  };
  
  return statusMap[status] || {
    label: "Unknown",
    color: "secondary",
    icon: "help-circle",
    description: "Unknown payment status"
  };
};

// ================================
// ENHANCED BOOKING WITH PAYMENT
// ================================

/**
 * Complete booking flow with payment
 * @param {string} eventId - Event ID
 * @param {object} bookingData - Complete booking information
 */
export const bookEventWithPayment = async (eventId, bookingData) => {
  try {
    const eventResponse = await getEvent(eventId);
    const event = eventResponse?.data?.data;
    
    if (!event || !event.date || !event.status) {
      throw new Error('Validation failed: Event data is incomplete.');
    }
    
    const validation = validatePaymentData(bookingData, event);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }
    
    const response = await initializePayment(eventId, bookingData);
    
    if (!response || !response.data) {
      throw new Error('Failed to initialize payment: No data received.');
    }
    
    const paymentResponse = response.data;
    
    if (!paymentResponse.success) {
      throw new Error(paymentResponse.message || 'Failed to initialize payment');
    }
    
    return {
      success: true,
      paymentUrl: paymentResponse.data.paymentUrl,
      reference: paymentResponse.data.reference,
      amount: paymentResponse.data.amount,
      eventTitle: paymentResponse.data.eventTitle
    };
    
  } catch (error) {
    throw error;
  }
};
/**
 * Check and complete payment verification
 * @param {string} reference - Payment reference from URL params
 */
export const completePaymentAndBooking = async (reference) => {
  try {
    
    const verificationResponse = await verifyPayment(reference);
    
    let isSuccess = false;
    let bookingData = null;
    let message = '';
    
    if (verificationResponse) {
      if (verificationResponse.success === true) {
        isSuccess = true;
        bookingData = verificationResponse.data;
        message = verificationResponse.message;
      }
      else if (verificationResponse.data && verificationResponse.data.success === true) {
        isSuccess = true;
        bookingData = verificationResponse.data.data || verificationResponse.data;
        message = verificationResponse.data.message || verificationResponse.message;
      }
      else if (verificationResponse.status === true || verificationResponse.status === 'success') {
        isSuccess = true;
        bookingData = verificationResponse.data || verificationResponse;
        message = verificationResponse.message || 'Payment verified successfully';
      }
      else if (verificationResponse.status >= 200 && verificationResponse.status < 300) {
        isSuccess = true;
        bookingData = verificationResponse.data;
        message = verificationResponse.message || 'Payment verified successfully';
      }
      else if (verificationResponse.data && Object.keys(verificationResponse.data).length > 0) {
        isSuccess = true;
        bookingData = verificationResponse.data;
        message = 'Payment verified successfully';
      }
    }
    
    if (!isSuccess) {
      const errorMessage = verificationResponse?.message || 
                          verificationResponse?.data?.message || 
                          'Payment verification failed';
      throw new Error(errorMessage);
    }
    
    return {
      success: true,
      booking: bookingData,
      message: message || 'Booking completed successfully'
    };
    
  } catch (error) {
    
    if (error.message === 'Payment verification failed' && !error.context) {
      error.context = 'Payment verification response did not indicate success';
    }
    
    throw error;
  }
};
// ================================
// PAYMENT POLLING FOR REAL-TIME UPDATES
// ================================

/**
 * Poll payment status until completion or timeout
 * @param {string} reference - Payment reference
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Polling interval in milliseconds
 */
export const pollPaymentStatus = async (reference, maxAttempts = 30, interval = 2000) => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++;
        const response = await getPaymentStatus(reference);
        
        if (response.success) {
          const status = response.data.status;
          
          // Terminal states
          if (['successful', 'failed', 'abandoned'].includes(status)) {
            resolve(response);
            return;
          }
        }
        
        // Continue polling if not terminal state and within max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          reject(new Error('Payment status polling timeout'));
        }
        
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          reject(error);
        }
      }
    };
    
    poll();
  });
};

// UTILITY FUNCTIONS FOR BOOKING
// ================================

export const isEventBookable = (event) => {
  if (!event) {
    return false;
  }

  const now = new Date();
  const eventDate = new Date(event.date);
  const availableSeats = (event.seats || 0) - (event.seatsBooked?.length || 0);
  
  return event.status === "Published" && eventDate > now && availableSeats > 0;
};

export const getBookingInfo = (event, isBooked = false) => {
  const totalSeats = event.seats || 0;
  const bookedSeats = event.seatsBooked?.length || 0;
  const availableSeats = totalSeats - bookedSeats;
  const bookingPercentage =
    totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

  return {
    totalSeats,
    bookedSeats,
    availableSeats,
    bookingPercentage: Math.round(bookingPercentage),
    isFullyBooked: availableSeats === 0,
    isNearlyFull: bookingPercentage >= 80,
    isBooked,
    canBook: !isBooked && availableSeats > 0 && isEventBookable(event),
  };
};

export const getBookingStatusText = (bookingInfo) => {
  if (bookingInfo.isBooked) return "Booked";
  if (bookingInfo.isFullyBooked) return "Fully Booked";
  if (bookingInfo.isNearlyFull)
    return `Only ${bookingInfo.availableSeats} seats left`;
  return `${bookingInfo.availableSeats} seats available`;
};

export const getBookingButtonText = (bookingInfo) => {
  if (bookingInfo.isBooked) return "Cancel Booking";
  if (bookingInfo.isFullyBooked) return "Fully Booked";
  return "Book Now";
};

export const getBookingButtonClass = (bookingInfo) => {
  if (bookingInfo.isBooked) return "btn-danger"; // Red for cancel
  if (bookingInfo.isFullyBooked) return "btn-secondary"; // Gray for disabled
  return "btn-primary"; // Blue for book now
};

// ================================
// BOOKING HELPER FUNCTIONS
// ================================

/**
 * Handles booking with automatic fallback
 * @param {string} id - Event ID
 * @param {Object} formData - Optional form data for enhanced booking
 * @param {boolean} useLegacy - Force use of legacy single booking
 */
export const handleBooking = async (id, formData = {}, useLegacy = false) => {
  try {
    if (useLegacy || Object.keys(formData).length === 0) {
      return await bookEventSingle(id);
    }
    return await bookEvent(id, formData);
  } catch (error) {
    if (!useLegacy) {
      return await bookEventSingle(id);
    }
    throw error;
  }
};

/**
 * Batch check booking status for multiple events
 * @param {Array} eventIds - Array of event IDs
 */
export const checkMultipleBookingStatus = async (eventIds) => {
  try {
    const promises = eventIds.map(id => checkBookingStatus(id));
    const results = await Promise.allSettled(promises);
    
    return eventIds.reduce((acc, id, index) => {
      const result = results[index];
      acc[id] = result.status === 'fulfilled' ? result.value : null;
      return acc;
    }, {});
  } catch (error) {
    return {};
  }
};