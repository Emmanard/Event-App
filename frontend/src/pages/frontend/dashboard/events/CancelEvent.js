import { Avatar, Modal } from 'antd'
import './_events.scss';
import React, { useEffect, useState } from 'react'
import { getEditEvent } from 'services/event'
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import { UserOutlined } from '@ant-design/icons';

export default function CancelEvent({ open, setOpen, id }) {
    const [event, setEvent] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getEvent()
    }, [])

    const getEvent = async () => {
        try {
            let { data } = await getEditEvent(id);
            setEvent(data?.data);
        } catch (error) {
            console.log(error);
            let msg = "Some error occured";
            let { status, data } = error.response;
            if (status == 400 || status == 401 || status == 500 || status == 413) {
                msg = data.message || data.msg;
                window.toastify(msg, "error");
            }
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div >
            <Modal
                title={''}
                centered
                open={open}
                onOk={() => setOpen(false)}
                onCancel={() => setOpen(false)}
                width={1000}
                footer={[]}
                className='event-modal my-2'
            >
                <div className="container-fluid">
                    {isLoading
                        ? <div className="row">
                            <div className="col">
                                <div className='my-5 text-center'>
                                    <div className="spinner-grow bg-info"></div>
                                    <div className="spinner-grow bg-warning mx-3"></div>
                                    <div className="spinner-grow bg-info"></div>
                                    <div>Loading...</div>
                                </div>
                            </div>
                        </div>
                        :
                        <>
                        
                        </>
                    }
                </div>

            </Modal>
        </div>
    )
}
