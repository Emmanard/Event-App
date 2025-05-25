import React, { useEffect, useState } from 'react'
import { Avatar, Input, Pagination } from 'antd'
import { UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import LoadingIndicator from 'components/LoadingIndicator';
import { addComment, deleteComment, getComments } from 'services/event';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { useAuthContext } from 'context/AuthContext';

export default function Comments({ id, getEventData }) {
    const { TextArea } = Input;
    const { user } = useAuthContext()
    const [fullName, setFullName] = useState("")
    const [comment, setComment] = useState("")
    const [comments, setComments] = useState([])
    const [commentsCount, setCommentsCount] = useState(0)
    const [commentLoading, setCommentLoading] = useState(false)
    const [delLoading, setDelLoading] = useState(false)
    const [page, setPage] = useState(1)


    useEffect(() => {
        // window.scroll(0, 0)
        getEventComments()
    }, [page])

    const getEventComments = async () => {
        try {
            let { data } = await getComments(id, page);
            setComments(data?.data)
            setCommentsCount(data?.count)
        } catch (error) {
            console.log(error);
            let msg = "Some error occured";
            let { status, data } = error?.response;
            if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
                msg = data?.message || data?.msg;
                window.toastify(msg, "error");
            }
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        let state = { fullName, comment }
        setCommentLoading(true)
        try {
            let { data } = await addComment(id, state);
            window.toastify(data?.msg, "success");
            getEventComments()
            getEventData()
            setFullName("")
            setComment("")
        } catch (error) {
            console.log(error);
            let msg = "Some error occured";
            let { status, data } = error?.response;
            if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
                msg = data.message || data.msg;
                window.toastify(msg, "error");
            }
        }
        finally {
            setCommentLoading(false)
        }
    }


    const handleDeleteComment = async (comment) => {
        setDelLoading(true)
        try {
            let { data } = await deleteComment(comment?._id);
            window.toastify(data?.msg, "success");
            getEventComments()
            getEventData()
        } catch (error) {
            console.log(error);
            let msg = "Some error occured";
            let { status, data } = error?.response;
            if (status == 400 || status == 401 || status == 500 || status == 413 || status == 404) {
                msg = data.message || data.msg;
                window.toastify(msg, "error");
            }
        }
        finally {
            setDelLoading(false)
        }
    }
    return (
        <>
            <LoadingIndicator loading={commentLoading} />

            <h2 className='heading-stylling mt-5' >Comments</h2>
            <div className="row my-5">
                <div className="col text-center">
                    <Pagination className='w-100' responsive onChange={e => setPage(e)} defaultCurrent={1} total={commentsCount} />
                </div>
            </div>
            <div className="row row-cols-1">
                <div className="col mb-5">
                    {comments?.map((item, i) => {
                        return <div key={i} className="card border-0 shadow p-3 mt-4" id='comment-text-card'>
                            <div className="d-flex align-items-center gap-4">
                                <div >
                                    <Avatar src={item?.addedBy?.image} shape="square" size={50} icon={<UserOutlined />} />
                                </div>
                                <div className='w-100'>
                                    {/* <div className="d-flex"> */}
                                    <h6>{item?.fullName}</h6>
                                    <div><small>{item?.addedBy?.fullName}</small></div>
                                    {/* </div> */}
                                </div>
                            </div>
                            <p className='text-secondary mt-3'>
                                {item?.comment}
                            </p>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <small>{moment(item?.createdAt).format('MMM D, YYYY')}</small>
                                    <small className='border-start ms-2 ps-2'>{moment(item?.createdAt).format('hh:mm a')}</small>
                                </div>
                                {user?._id === item?.addedBy?._id
                                    && <div>
                                        <button className='btn btn-outline-danger btn-sm' disabled={delLoading} onClick={() => handleDeleteComment(item)}>
                                            {delLoading
                                                ? <div className='spinner-border spinner-border-sm'></div>
                                                : <DeleteTwoToneIcon fontSize='small' />
                                            }

                                        </button>
                                    </div>
                                }
                            </div>
                        </div>
                    })}
                </div><hr />
                <div className="col mt-4 ">
                    <div className="card border-0 shadow p-4">
                        <h5>Leave Your Comment</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4 mt-1">
                                <div className="col-12">
                                    <Input size='large' name='fullName' required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter Full Name" />
                                </div>
                                <div className="col-12">
                                    <TextArea
                                        showCount
                                        maxLength={1000}
                                        name='comment'
                                        required
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Write your comment here..."
                                        style={{
                                            height: 120,
                                        }}
                                    />
                                </div>
                                <div className="col">
                                    <button className='button-stylling-1 px-5' disabled={commentLoading}>
                                        {commentLoading
                                            ? <div className='spinner-border spinner-border-sm'></div>
                                            : "Submit Now"
                                        }
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </>
    )
}
