import React, { useEffect, useState } from 'react'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    useEffect(() => {
        window.scroll(0, 0);
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Contact form submitted:', formData)
        // Add your contact form submission logic here
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <>
            <Navbar />
            <div style={{ paddingTop: '120px', minHeight: '70vh' }}>
                <div className="container">
                    <div className="row mb-5">
                        <div className="col">
                            <h5 className='text-center text-warning'>Contact</h5>
                            <h2 className='heading-stylling display-5'>GET IN TOUCH</h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6 mb-4">
                            <div className="card p-4">
                                <h4>Send us a message</h4>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Your Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="Your Email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            placeholder="Your Message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="button-stylling-1 px-4">
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card p-4">
                                <h4>Contact Information</h4>
                                <div className="mb-3">
                                    <h6>Address</h6>
                                    <p>123 Event Street, City, State 12345</p>
                                </div>
                                <div className="mb-3">
                                    <h6>Phone</h6>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                                <div className="mb-3">
                                    <h6>Email</h6>
                                    <p>info@eventwave.com</p>
                                </div>
                                <div className="mb-3">
                                    <h6>Business Hours</h6>
                                    <p>Monday - Friday: 9:00 AM - 6:00 PM<br />
                                       Saturday: 10:00 AM - 4:00 PM<br />
                                       Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
