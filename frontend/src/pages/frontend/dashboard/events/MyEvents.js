import React, { useEffect, useRef, useState, useCallback } from 'react'
import { delEvent, getMyEvents, updateEvent, getMyBookedEvents, cancelBooking, getPaymentHistory } from 'services/event';
import { Popconfirm, Switch, Button, Input, Space, Table, Tabs, Badge, Tag } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, QuestionCircleOutlined, CalendarOutlined, UserOutlined, CreditCardOutlined, DollarOutlined } from '@ant-design/icons';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import ExitToAppTwoToneIcon from '@mui/icons-material/ExitToAppTwoTone';
import { useNavigate } from 'react-router-dom';
import ViewEvent from './ViewEvent';
import CancelEvent from './CancelEvent';
import { deleteFromCloudinary } from 'services/cloudinary';
import { useAuthContext } from 'context/AuthContext';
import moment from 'moment';
const { TabPane } = Tabs;


export default function MyEvents() {
    const [createdEvents, setCreatedEvents] = useState([]);
    const [bookedEvents, setBookedEvents] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openCancelModal, setOpenCancelModal] = useState(false);
    const [modalEventId, setModalEventId] = useState("");
    const [activeTab, setActiveTab] = useState("created");
    const searchInput = useRef(null);
    const navigate = useNavigate();
    
    // Get user from auth context
    const { user } = useAuthContext();
    const userRole = user?.role || 'attendee'; // Default to attendee if role not found

    const handleError = (error, defaultMsg = "Some error occurred") => {
        const { status, data } = error.response || {};
        const msg = [400, 401, 404, 413, 500].includes(status) 
            ? (data?.message || data?.msg) 
            : defaultMsg;
        window.toastify(msg, "error");
    };

    // Get created events (for organizers)
    const getCreatedEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await getMyEvents();
            const eventsWithKeys = data?.data?.map(event => ({
                ...event,
                key: event._id || event.id,
                eventType: 'created'
            }));
            setCreatedEvents(eventsWithKeys || []);
        } catch (error) {
            console.log(error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get booked events (for attendees)
    const getBookedEventsData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await getMyBookedEvents(); // Using your existing API
            const eventsWithKeys = data?.data?.map(event => ({
                ...event,
                key: `booked_${event._id || event.id}`,
                eventType: 'booked'
            }));
            setBookedEvents(eventsWithKeys || []);
        } catch (error) {
            console.log(error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Enhanced get payment history with better error handling and data mapping
    const getPaymentHistoryData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await getPaymentHistory();
            console.log('Payment history raw data:', data); // Debug log
            
            // Handle your specific API response structure
            let paymentData = [];
            if (data?.data?.payments) {
                paymentData = Array.isArray(data.data.payments) ? data.data.payments : [data.data.payments];
            } else if (data?.payments) {
                paymentData = Array.isArray(data.payments) ? data.payments : [data.payments];
            } else if (data?.data && Array.isArray(data.data)) {
                paymentData = data.data;
            } else if (Array.isArray(data)) {
                paymentData = data;
            }

            console.log('Extracted payment data:', paymentData);

            // Process payments - eventId is already populated as an object
            const paymentsWithKeys = paymentData.map((payment, index) => {
                console.log(`Processing payment ${index + 1}:`, {
                    paymentId: payment._id,
                    eventId: payment.eventId,
                    amount: payment.amount,
                    status: payment.status,
                    reference: payment.reference
                });

                // eventId is already an object with event details
                const eventDetails = payment.eventId;
                console.log('Event details from eventId:', eventDetails);

                const processedPayment = {
                    ...payment,
                    key: payment._id || payment.id || `payment_${index}`,
                    eventType: 'payment',
                    // Map fields with event details (eventId is already populated)
                    eventTitle: eventDetails?.title || payment.bookingDetails?.eventTitle || 'Event Details Unavailable',
                    eventDate: eventDetails?.date || payment.bookingDetails?.eventDate || null,
                    eventId: typeof eventDetails === 'object' ? eventDetails._id || eventDetails.id : eventDetails,
                    eventObject: eventDetails, // Keep the full event object
                    reference: payment.reference,
                    amount: payment.amount || 0,
                    status: payment.status || 'unknown',
                    createdAt: payment.createdAt || new Date().toISOString(),
                    // Keep original event details for reference
                    eventDetails: eventDetails
                };
                
                console.log('Final processed payment:', processedPayment);
                return processedPayment;
            });

            console.log('All processed payment data:', paymentsWithKeys);
            setPaymentHistory(paymentsWithKeys || []);
        } catch (error) {
            console.log('Payment history error:', error);
            handleError(error, "Failed to load payment history");
            // Set empty array on error to prevent undefined issues
            setPaymentHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch all data based on active tab
    const fetchDataForTab = useCallback(async (tabKey) => {
        switch (tabKey) {
            case 'created':
                if (userRole === 'organizer') {
                    await getCreatedEvents();
                }
                break;
            case 'booked':
                await getBookedEventsData();
                break;
            case 'payments':
                await getPaymentHistoryData();
                break;
            default:
                break;
        }
    }, [getCreatedEvents, getBookedEventsData, getPaymentHistoryData, userRole]);

    useEffect(() => {
        window.scroll(0, 0);
        // Load data for current active tab
        fetchDataForTab(activeTab);
    }, [fetchDataForTab, activeTab]);

    // Handle tab change with role-based access control
    const handleTabChange = (key) => {
        if (key === 'created' && userRole !== 'organizer') {
            // Show popup message for non-organizers
            window.toastify("Only organizers can create events. Please upgrade your account to become an organizer.", "warning");
            return; // Don't change the tab
        }
        setActiveTab(key);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        borderColor: "#9accc9",
                        marginBottom: 8,
                        boxShadow: "0px 0px 2px #9accc9",
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90, backgroundColor: "#9accc9" }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button type="link" size="small" className='text-warning' onClick={close}>
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) setTimeout(() => searchInput.current?.select(), 100);
        },
        render: (text) => {
            const displayText = dataIndex === "date" ? text?.split('T')[0] : text;
            return searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={displayText?.toString() || ''}
                />
            ) : displayText;
        },
    });

    // Enhanced helper functions for payment display
    const formatPaymentReference = (reference) => {
        if (!reference) return 'N/A';
        
        // Handle different reference formats
        if (reference.length > 20) {
            return `${reference.substring(0, 10)}...${reference.substring(reference.length - 6)}`;
        }
        return reference.length > 15 ? `${reference.substring(0, 15)}...` : reference;
    };

    const getPaymentStatusInfo = (status) => {
        const statusLower = (status || '').toLowerCase();
        const statusMap = {
            'successful': { label: 'Successful', color: 'success' },
            'success': { label: 'Successful', color: 'success' },
            'completed': { label: 'Completed', color: 'success' },
            'confirmed': { label: 'Confirmed', color: 'success' },
            'paid': { label: 'Paid', color: 'success' },
            'pending': { label: 'Pending', color: 'warning' },
            'processing': { label: 'Processing', color: 'processing' },
            'failed': { label: 'Failed', color: 'error' },
            'cancelled': { label: 'Cancelled', color: 'error' },
            'canceled': { label: 'Cancelled', color: 'error' },
            'refunded': { label: 'Refunded', color: 'default' },
            'abandoned': { label: 'Abandoned', color: 'default' }
        };
        return statusMap[statusLower] || { label: status || 'Unknown', color: 'default' };
    };

    const baseColumns = [
        { title: 'Title', dataIndex: 'title', key: 'title' },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        { title: 'Country', dataIndex: 'country', key: 'country' },
        { title: 'City', dataIndex: 'city', key: 'city' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
    ];

    // Columns for created events (organizer view)
    const createdEventsColumns = [
        ...baseColumns.map((col, index) => ({ 
            ...col, 
            ...getColumnSearchProps(col.dataIndex),
            key: col.key || `created-col-${index}`
        })),
        {
            title: 'Views',
            dataIndex: 'views',
            key: 'views',
            render: (views) => views?.length || 0
        },
        {
            title: 'Likes',
            dataIndex: 'likes',
            key: 'likes',
            render: (likes) => likes?.length || 0
        },
        {
            title: 'Attendees',
            dataIndex: 'seatsBooked',
            key: 'attendees',
            render: (seatsBooked, record) => {
                const attendeeCount = seatsBooked?.length || 0;
                const totalSeats = record.seats || 0;
                return totalSeats > 0 ? `${attendeeCount}/${totalSeats}` : attendeeCount;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            ...getColumnSearchProps('status'),
            render: (status) => (
                <Badge 
                    status={status === 'Published' ? 'success' : status === 'Draft' ? 'warning' : 'error'} 
                    text={status} 
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const isClosed = record.status === "Closed";
                const isPublished = record.status === "Published";
                
                return (
                    <div className='d-flex justify-content-evenly align-items-center'>
                        <Switch 
                            className='ms-1' 
                            unCheckedChildren={!isPublished && record.status}
                            disabled={isClosed}
                            loading={statusLoading}
                            checkedChildren="Active"
                            size='small'
                            checked={isPublished}
                            onChange={() => handleStatus(record)}
                        />
                        <Button 
                            type='dashed' 
                            onClick={() => { setOpenModal(true); setModalEventId(record?._id); }}
                            className='ms-1 d-flex align-items-center justify-content-center'
                            title="View Event"
                        >
                            <VisibilityTwoToneIcon fontSize='small' />
                        </Button>
                        <Button 
                            type='default' 
                            disabled={isClosed}
                            onClick={() => navigate(`/dashboard/events/edit/${record?._id}`)}
                            className='ms-1 d-flex align-items-center justify-content-center'
                            title="Edit Event"
                        >
                            <EditTwoToneIcon fontSize='small' />
                        </Button>
                        <Popconfirm
                            title="Delete the event"
                            description="Are you sure you want to delete this event? This action will cancel the event for all attendees."
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={() => handleDelEvent(record)}
                            okType='danger'
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger className='ms-1 d-flex align-items-center justify-content-center' title="Delete Event">
                                <DeleteTwoToneIcon fontSize='small' />
                            </Button>
                        </Popconfirm>
                    </div>
                );
            },
        },
    ];

    // Columns for booked events (attendee view)
    const bookedEventsColumns = [
        ...baseColumns.map((col, index) => ({ 
            ...col, 
            ...getColumnSearchProps(col.dataIndex),
            key: col.key || `booked-col-${index}`
        })),
        {
            title: 'Organizer',
            dataIndex: ['organizer', 'name'], // Assuming organizer info is populated
            key: 'organizer',
            render: (text, record) => record.organizer?.name || record.organizer?.email || 'N/A'
        },
        {
            title: 'Booking Date',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
        },
        {
            title: 'Booking Status',
            dataIndex: 'bookingStatus',
            key: 'bookingStatus',
            render: (status, record) => {
                // Handle different possible status sources
                const bookingStatus = status || record.status || 'confirmed';
                const eventStatus = record.eventStatus || record.status;
                
                // Determine display status
                let displayStatus = bookingStatus;
                let badgeStatus = 'success';
                
                if (eventStatus === 'Closed' || eventStatus === 'Cancelled') {
                    displayStatus = 'Event Cancelled';
                    badgeStatus = 'error';
                } else if (bookingStatus === 'cancelled') {
                    displayStatus = 'Booking Cancelled';
                    badgeStatus = 'error';
                } else if (bookingStatus === 'pending') {
                    displayStatus = 'Pending';
                    badgeStatus = 'processing';
                }
                
                return (
                    <Badge 
                        status={badgeStatus} 
                        text={displayStatus} 
                    />
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const eventDate = new Date(record.date);
                const now = new Date();
                const isPastEvent = eventDate < now;
                const isCancelled = record.bookingStatus === 'cancelled' || record.status === 'Closed';
                
                return (
                    <div className='d-flex justify-content-evenly align-items-center'>
                        <Button 
                            type='dashed' 
                            onClick={() => { setOpenModal(true); setModalEventId(record?._id); }}
                            className='ms-1 d-flex align-items-center justify-content-center'
                            title="View Event"
                        >
                            <VisibilityTwoToneIcon fontSize='small' />
                        </Button>
                        {!isPastEvent && !isCancelled && (
                            <Popconfirm
                                title="Cancel your booking"
                                description="Are you sure you want to cancel your booking for this event?"
                                icon={<QuestionCircleOutlined style={{ color: 'orange' }} />}
                                onConfirm={() => handleCancelBooking(record)}
                                okType='danger'
                                okText="Yes, Cancel"
                                cancelText="No"
                            >
                                <Button 
                                    type='default' 
                                    className='ms-1 d-flex align-items-center justify-content-center'
                                    title="Cancel Booking"
                                >
                                    <ExitToAppTwoToneIcon fontSize='small' />
                                </Button>
                            </Popconfirm>
                        )}
                        {isPastEvent && (
                            <Button 
                                type='dashed' 
                                disabled
                                className='ms-1 d-flex align-items-center justify-content-center'
                                title="Event has ended"
                            >
                                Past Event
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    // Enhanced columns for payment history
    const paymentHistoryColumns = [
        {
            title: 'Event',
            dataIndex: 'eventTitle',
            key: 'eventTitle',
            ...getColumnSearchProps('eventTitle'),
            render: (text, record) => (
                <div>
                    <strong>{text || 'Event Details Unavailable'}</strong>
                    {record.eventDetails?.date && (
                        <>
                            <br />
                            <small className="text-muted">
                                <CalendarOutlined className="me-1" />
                                {moment(record.eventDetails.date).format('MMM D, YYYY')}
                            </small>
                        </>
                    )}
                    {record.eventDetails?.category && (
                        <>
                            <br />
                            <small className="text-info">
                                {record.eventDetails.category}
                            </small>
                        </>
                    )}
                </div>
            ),
        },
        {
            title: 'Payment Reference',
            dataIndex: 'reference',
            key: 'reference',
            ...getColumnSearchProps('reference'),
            render: (reference) => (
                <code style={{ fontSize: '12px' }}>
                    {formatPaymentReference(reference)}
                </code>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <span className="text-success">
                    ₦{(amount || 0).toLocaleString()}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusInfo = getPaymentStatusInfo(status);
                return (
                    <Tag color={statusInfo.color}>
                        {statusInfo.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Payment Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => {
                return date ? moment(date).format('MMM D, YYYY h:mm A') : 'N/A';
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                // Use the processed eventId (which should be the actual ID string)
                const eventId = record.eventId || record.eventObject?._id || record.eventObject?.id;
                return (
                    <div className='d-flex justify-content-start align-items-center'>
                        {eventId ? (
                            <Button 
                                type='link' 
                                onClick={() => navigate(`/event/${eventId}`)}
                                className='d-flex align-items-center justify-content-center'
                                title="View Event"
                            >
                                <VisibilityTwoToneIcon fontSize='small' className="me-1" />
                                View Event
                            </Button>
                        ) : (
                            <span className="text-muted">Event not available</span>
                        )}
                    </div>
                );
            },
        },
    ];

    const handleStatus = async (record) => {
        const statusMap = { "Published": "Draft", "Draft": "Published" };
        const newStatus = statusMap[record?.status];

        if (!newStatus) {
            return window.toastify(`Event is ${record?.status}. You can't change status`, "error");
        }

        setStatusLoading(true);
        try {
            const { data } = await updateEvent(record?._id, { status: newStatus });
            window.toastify(data?.msg, "success");
            getCreatedEvents(); // Refresh created events
        } catch (error) {
            console.log(error);
            handleError(error);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleCancelBooking = async (record) => {
        try {
            const { data } = await cancelBooking(record?._id); // Using your existing API
            window.toastify(data?.msg || "Booking cancelled successfully", "success");
            getBookedEventsData(); // Refresh booked events
        } catch (error) {
            console.log(error);
            handleError(error);
        }
    };

    const extractPublicId = (imageUrl) => {
        if (!imageUrl?.includes("cloudinary.com")) return null;
        
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex === -1) return null;
        
        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
        return pathAfterUpload.split('.')[0];
    };

    const handleDelEvent = async (record) => {
        try {
            // Delete image from Cloudinary if exists
            if (record?.image) {
                const publicId = extractPublicId(record.image);
                if (publicId) {
                    try {
                        await deleteFromCloudinary(publicId);
                    } catch (cloudinaryError) {
                        console.warn('Failed to delete image from Cloudinary, proceeding with event deletion:', cloudinaryError);
                    }
                }
            }
            
            const { data } = await delEvent(record?._id);
            getCreatedEvents(); // Refresh created events
            window.toastify(data?.msg, "success");
        } catch (error) {
            console.log(error);
            handleError(error);
        }
    };

    // Enhanced renderTabContent with debug info and empty states
    const renderTabContent = (events, columns) => {
        // Add debug info for payment history
        if (activeTab === 'payments') {
            console.log('Rendering payment history with events:', events);
            console.log('Using columns:', columns.map(col => col.key));
        }
        
        return (
            <div className="row">
                <div className="col" style={{ overflow: "auto" }}>
                    {isLoading ? (
                        <div className='my-5 text-center'>
                            <div className="spinner-grow spinner-grow-sm bg-info"></div>
                            <div className="spinner-grow spinner-grow-sm bg-warning mx-3"></div>
                            <div className="spinner-grow spinner-grow-sm bg-info"></div>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-3">
                                {activeTab === 'payments' && <CreditCardOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                                {activeTab === 'booked' && <CalendarOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                                {activeTab === 'created' && <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                            </div>
                            <h4>No {activeTab === 'payments' ? 'Payment History' : activeTab === 'booked' ? 'Booked Events' : 'Created Events'} Found</h4>
                            <p className="text-muted">
                                {activeTab === 'payments' && "You haven't made any payments yet."}
                                {activeTab === 'booked' && "You haven't booked any events yet."}
                                {activeTab === 'created' && "You haven't created any events yet."}
                            </p>
                        </div>
                    ) : (
                        <Table 
                            columns={columns} 
                            dataSource={events}
                            rowKey={(record) => record.key || record._id || record.id}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => 
                                    `${range[0]}-${range[1]} of ${total} ${activeTab === 'payments' ? 'payments' : 'events'}`
                            }}
                            scroll={{ x: 800 }} // Add horizontal scroll for better mobile experience
                        />
                    )}
                </div>
            </div>
        );
    };

    // Add error boundary for the payment history tab
    const PaymentHistoryTab = () => {
        try {
            return renderTabContent(paymentHistory, paymentHistoryColumns);
        } catch (error) {
            console.error('Error rendering payment history:', error);
            return (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <CreditCardOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
                    </div>
                    <h4>Error Loading Payment History</h4>
                    <p className="text-muted">
                        There was an error loading your payment history. Please try again later.
                    </p>
                    <Button 
                        type="primary" 
                        onClick={() => getPaymentHistoryData()}
                        className="mt-2"
                    >
                        Retry
                    </Button>
                </div>
            );
        }
    };

    return (
        <div className="container">
            <h2 className='heading-stylling mb-5 pt-4'>MY EVENTS</h2>
            
            <Tabs 
                activeKey={activeTab} 
                onChange={handleTabChange}
                type="card"
                className="mb-4"
            >
                <TabPane 
                    tab={
                        <span>
                            <UserOutlined />
                            Events Created
                            <Badge count={createdEvents.length} style={{ marginLeft: 8 }} />
                            {userRole !== 'organizer' && (
                                <span style={{ marginLeft: 4, fontSize: '10px', color: '#ff4d4f' }}>
                                    (Organizers Only)
                                </span>
                            )}
                        </span>
                    } 
                    key="created"
                    disabled={userRole !== 'organizer'}
                >
                    {userRole === 'organizer' ? (
                        renderTabContent(createdEvents, createdEventsColumns)
                    ) : (
                        <div className="text-center py-5">
                            <div className="mb-3">
                                <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                            </div>
                            <h4>Organizer Access Required</h4>
                            <p className="text-muted">
                                Only organizers can create and manage events.
                            </p>
                        </div>
                    )}
                </TabPane>
                
                <TabPane 
                    tab={
                        <span>
                            <CalendarOutlined />
                            Events Booked
                            <Badge count={bookedEvents.length} style={{ marginLeft: 8 }} />
                        </span>
                    } 
                    key="booked"
                >
                    {renderTabContent(bookedEvents, bookedEventsColumns)}
                </TabPane>

                <TabPane 
                    tab={
                        <span>
                            <CreditCardOutlined />
                            Payment History
                            <Badge count={paymentHistory.length} style={{ marginLeft: 8 }} />
                        </span>
                    } 
                    key="payments"
                >
                    <PaymentHistoryTab />
                </TabPane>
            </Tabs>

            {openModal && <ViewEvent open={openModal} setOpen={setOpenModal} id={modalEventId} />}
            {openCancelModal && <CancelEvent open={openCancelModal} setOpen={setOpenCancelModal} id={modalEventId} />}
        </div>
    );
}