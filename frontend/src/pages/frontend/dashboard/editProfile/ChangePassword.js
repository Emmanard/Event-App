import { Input } from 'antd'
import LoadingIndicator from 'components/LoadingIndicator';
import { useAuthContext } from 'context/AuthContext';
import React, { useState } from 'react'
import { updateUserPassword } from 'services/auth';

export default function ChangePassword() {
    const { setToggle, toggle, user } = useAuthContext();
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return window.toastify("Password doesn't match", "error");
        }

        setLoading(true)
        try {
            let { data } = await updateUserPassword(user?._id, oldPassword, password);
            window.toastify(data.msg, "success");
            setToggle(!toggle);
            setOldPassword("");
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            let msg = "Some error occured";
            let { status, data } = error.response;
            if (status == 400 || status == 401 || status == 500) {
                msg = data.message;
                window.toastify(msg, "error");
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <LoadingIndicator loading={loading} />
            <div className='container'>
                <form onSubmit={handleSubmit}>
                    <div className="row g-3 g-sm-4 py-5">
                        <div className="col-12">
                            <label htmlFor="oldPass" className='mb-2'>Old Password <span className='text-danger'>*</span></label>
                            <Input placeholder="Enter old password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} id='oldPass' size='large' />
                        </div>
                        <div className="col-12 col-md-6">
                            <label htmlFor="newpass" className='mb-2'>New Password <span className='text-danger'>*</span></label>
                            <Input.Password placeholder="Enter new password" required value={password} onChange={e => setPassword(e.target.value)} id='newpass' size='large' />
                        </div>
                        <div className="col-12 col-md-6">
                            <label htmlFor="confirmpass" className='mb-2'>Confirm Password <span className='text-danger'>*</span></label>
                            <Input.Password placeholder="Confirm password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} id='confirmpass' size='large' />
                        </div>

                        <div className="col-12 mt-5">
                            <button className='button-stylling-1 px-5 ms-auto'>Change Password</button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}
