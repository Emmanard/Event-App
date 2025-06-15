import React, { useEffect, useRef, useState, useCallback } from 'react'
import { delEvent, getMyEvents, updateEvent, getMyBookedEvents, cancelBooking } from 'services/event';
import { Popconfirm, Switch, Button, Input, Space, Table, Tabs, Badge } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, QuestionCircleOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import ExitToAppTwoToneIcon from '@mui/icons-material/ExitToAppTwoTone';
import { useNavigate } from 'react-router-dom';
import ViewEvent from './ViewEvent';
import CancelEvent from './CancelEvent';
import { deleteFromCloudinary } from 'services/cloudinary';
import { useAuthContext } from 'context/AuthContext';
const { TabPane } = Tabs;


export default function MyEvents() {
    const [createdEvents, setCreatedEvents] = useState([]);
    const [bookedEvents, setBookedEvents] = useState([]);
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

    // Fetch both created and booked events
    const fetchAllEvents = useCallback(async () => {
        await Promise.all([
            getCreatedEvents(),
            getBookedEventsData()
        ]);
    }, [getCreatedEvents, getBookedEventsData]);

    useEffect(() => {
        window.scroll(0, 0);
        fetchAllEvents();
    }, [fetchAllEvents]);

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

    const renderTabContent = (events, columns) => (
        <div className="row">
            <div className="col" style={{ overflow: "auto" }}>
                {isLoading ? (
                    <div className='my-5 text-center'>
                        <div className="spinner-grow spinner-grow-sm bg-info"></div>
                        <div className="spinner-grow spinner-grow-sm bg-warning mx-3"></div>
                        <div className="spinner-grow spinner-grow-sm bg-info"></div>
                    </div>
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={events}
                        rowKey={(record) => record.key || record._id}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => 
                                `${range[0]}-${range[1]} of ${total} events`
                        }}
                    />
                )}
            </div>
        </div>
    );

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
            </Tabs>

            {openModal && <ViewEvent open={openModal} setOpen={setOpenModal} id={modalEventId} />}
            {openCancelModal && <CancelEvent open={openCancelModal} setOpen={setOpenCancelModal} id={modalEventId} />}
        </div>
    );
}