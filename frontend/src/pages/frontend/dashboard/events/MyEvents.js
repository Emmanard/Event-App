import React, { useEffect, useRef, useState } from 'react'
import { delEvent, getMyEvents, updateEvent } from 'services/event';
import { Popconfirm, Switch, Button, Input, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import { useNavigate } from 'react-router-dom';
import ViewEvent from './ViewEvent';
import CancelEvent from './CancelEvent';
import { deleteFromCloudinary } from 'services/cloudinary';

export default function MyEvents() {
    const [events, setEvents] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openCancelModal, setOpenCancelModal] = useState(false);
    const [modalEventId, setModalEventId] = useState("");
    const searchInput = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        window.scroll(0, 0);
        getEvents();
    }, []);

    const handleError = (error, defaultMsg = "Some error occurred") => {
        const { status, data } = error.response || {};
        const msg = [400, 401, 404, 413, 500].includes(status) 
            ? (data?.message || data?.msg) 
            : defaultMsg;
        window.toastify(msg, "error");
    };

    const getEvents = async () => {
        setIsLoading(true);
        try {
            const { data } = await getMyEvents();
            // Ensure each event has a unique key for the Table component
            const eventsWithKeys = data?.data?.map(event => ({
                ...event,
                key: event._id || event.id // Use _id or id as the key
            }));
            setEvents(eventsWithKeys);
        } catch (error) {
            console.log(error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
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

    const columns = [
        // Add explicit keys to mapped columns to avoid React warnings
        ...baseColumns.map((col, index) => ({ 
            ...col, 
            ...getColumnSearchProps(col.dataIndex),
            key: col.key || `base-col-${index}` // Ensure unique key
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            ...getColumnSearchProps('status'),
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
                        >
                            <VisibilityTwoToneIcon fontSize='small' />
                        </Button>
                        <Button 
                            type='default' 
                            disabled={isClosed}
                            onClick={() => navigate(`/dashboard/events/edit/${record?._id}`)}
                            className='ms-1 d-flex align-items-center justify-content-center'
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
                            <Button danger className='ms-1 d-flex align-items-center justify-content-center'>
                                <DeleteTwoToneIcon fontSize='small' />
                            </Button>
                        </Popconfirm>
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
        } catch (error) {
            console.log(error);
            handleError(error);
        } finally {
            getEvents();
            setStatusLoading(false);
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
            getEvents();
            window.toastify(data?.msg, "success");
        } catch (error) {
            console.log(error);
            handleError(error);
        }
    };

    return (
        <div className="container">
            <h2 className='heading-stylling mb-5 pt-4'>MY EVENTS</h2>
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
                            rowKey={(record) => record._id || record.key} // Explicit rowKey for Table
                        />
                    )}
                </div>
            </div>
            {openModal && <ViewEvent open={openModal} setOpen={setOpenModal} id={modalEventId} />}
            {openCancelModal && <CancelEvent open={openCancelModal} setOpen={setOpenCancelModal} id={modalEventId} />}
        </div>
    );
}