import LoadingIndicator from "components/LoadingIndicator";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from 'services/auth';

const initialState = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
}

export default function Register() {
    const [state, setState] = useState(initialState);
    const [accountType, setAccountType] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scroll(0, 0)
    }, [])

    const handleChange = e => {
        setState(s => ({ ...s, [e.target.name]: e.target.value }))
    }
    
    const handleSubmit = e => {
        e.preventDefault();
        const { firstName, lastName, email, phoneNumber, password, confirmPassword } = state;
        
        // verify email
        var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        
        // Phone number validation for organizers
        if (accountType === 2) {
            if (!phoneNumber) {
                return window.toastify("Please add phone number for organizer account", "error");
            }
            const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
            if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
                return window.toastify("Please add a valid phone number", "error");
            }
        }
        
        if (!email.match(validRegex)) {
            return window.toastify("Please add valid email", "error");
        }
        if (password !== confirmPassword) {
            return window.toastify("Password doesn't match", "error");
        }
        
        let role = accountType == 1 ? "attendee" : "organizer";
        let fullName = `${firstName} ${lastName}`;
        let body = {
            role,
            fullName,
            firstName,
            lastName,
            email,
            phoneNumber: accountType === 2 ? phoneNumber : undefined,
            password: confirmPassword,
        }

        addData(body)
    }

    const addData = async (body) => {
        setLoading(true)
        try {
            let data = await registerUser(body);
            let msg = data.data.msg;
            let user = data.data.data;
            window.toastify(msg, "success");
            navigate("/auth/verifyOTP", { state: { email: user.email } });
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
            <div id='auth-page-left'>
                <div className='container'>
                    <div className="row">
                        <div className="col">
                            <div className="card shadow-lg rounded-5 border-0 mt-3 mb-4">
                                <div className="row row-cols-1 row-cols-md-2 g-0">
                                    <div className="col text-light d-none d-md-block">
                                        <div className="row d-flex align-items-center justify-content-center">
                                            <div className="col-9 text-center">
                                                <h1 className="fw-bold">Join us to explore the world</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col p-3 p-md-4 px-2 px-lg-5 my-4">
                                        <h3 className='text-warning text-center mb-5'>Register</h3>
                                        <div className="container h-auto mb-3">
                                            <div className="row px-3 px-lg-4 ">
                                                <div className="col p-0">
                                                    <button className={`btn  ${accountType === 1 ? "btn-info" : "btn-outline-info"} text-dark rounded-end-0 w-100 h-100 p-3`} onClick={() => setAccountType(1)}>
                                                        Attendees
                                                    </button>
                                                </div>
                                                <div className="col p-0" >
                                                    <button className={`btn ${accountType === 2 ? "btn-info" : "btn-outline-info"}  text-dark rounded-start-0 w-100 h-100 p-3`} onClick={() => setAccountType(2)}>
                                                        Organizers
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <form className="px-3 px-lg-4" onSubmit={handleSubmit}>
                                            <div className="row row-cols-1 row-cols-sm-2 mb-3 h-auto">
                                                <div className="col">
                                                    <div className="form-floating ">
                                                        <input type="text" name="firstName" className="form-control shadow-none" required id="fname" placeholder="Enter your first name" onChange={handleChange} />
                                                        <label htmlFor="fname" className="text-secondary">First Name</label>
                                                    </div>
                                                </div>
                                                <div className="col mt-3 mt-sm-0">
                                                    <div className="col">
                                                        <div className="form-floating ">
                                                            <input type="text" name="lastName" className="form-control shadow-none" required id="lname" placeholder="Enter your last name" onChange={handleChange} />
                                                            <label htmlFor="lname" className="text-secondary">Last Name</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {accountType === 2 && <div className="form-floating mb-3">
                                                <input 
                                                    type="tel" 
                                                    name="phoneNumber" 
                                                    className="form-control shadow-none" 
                                                    id="phone" 
                                                    placeholder="+1234567890" 
                                                    value={state.phoneNumber} 
                                                    onChange={handleChange}
                                                    required 
                                                />
                                                <label htmlFor="phone" className="text-secondary">Phone Number</label>
                                            </div>}

                                            <div className="form-floating mb-3">
                                                <input type="email" name="email" className="form-control shadow-none" id="floatingInput" required placeholder="name@example.com" onChange={handleChange} />
                                                <label htmlFor="floatingInput" className="text-secondary">Email Address</label>
                                            </div>
                                            <div className="form-floating mb-3">
                                                <input type="password" name="password" className="form-control shadow-none" id="floatingInput1" required placeholder="Enter Password" onChange={handleChange} />
                                                <label htmlFor="floatingInput1" className="text-secondary">Password</label>
                                            </div>
                                            <div className="form-floating mb-3">
                                                <input type="password" name="confirmPassword" className="form-control shadow-none" id="floatingInput2" required placeholder="Enter Password" onChange={handleChange} />
                                                <label htmlFor="floatingInput2" className="text-secondary">Confirm Password</label>
                                            </div>
                                            <div className="mb-5">
                                                <button className="button-stylling w-100 py-3 rounded bg-info border-0" type="submit" >
                                                    <span className="text">Register</span>
                                                    <span>Register</span>
                                                </button>
                                            </div>
                                            <p className="text-center text-secondary">Already have an account? <Link to="/auth/login" className="text-decoration-none">Login</Link></p>
                                        </form>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}