import React, { useEffect, useState } from 'react'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { message } from 'antd'
import emailjs from '@emailjs/browser'

const CONTACT_INFO = {
    address: "Lagos, Nigeria",
    phone: "+2348086804544",
    email: "emmanuelomunizua@gmail.com",
    businessHours: {
        weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
        saturday: "Saturday: 10:00 AM - 2:00 PM", 
        sunday: "Sunday: Closed"
    }
}

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        window.scroll(0, 0)
        
        // Initialize EmailJS once when component mounts
        emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Send email using EmailJS
            await emailjs.send(
                process.env.REACT_APP_EMAILJS_SERVICE_ID,
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    to_email: CONTACT_INFO.email
                }
            )

            message.success('Message sent successfully!')
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            console.error('Error sending message:', error)
            
            if (error.text) {
                message.error(`Failed to send: ${error.text}`)
            } else {
                message.error('Failed to send message. Please check your EmailJS configuration.')
            }
        } finally {
            setIsSubmitting(false)
        }
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
                                            disabled={isSubmitting}
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
                                            disabled={isSubmitting}
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
                                            disabled={isSubmitting}
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
                                            disabled={isSubmitting}
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="button-stylling-1 px-4"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card p-4">
                                <h4>Contact Information</h4>
                                <div className="mb-3">
                                    <h6>Address</h6>
                                    <p>{CONTACT_INFO.address}</p>
                                </div>
                                <div className="mb-3">
                                    <h6>Phone</h6>
                                    <p>
                                        <a href={`tel:${CONTACT_INFO.phone}`}>
                                            {CONTACT_INFO.phone}
                                        </a>
                                    </p>
                                </div>
                                <div className="mb-3">
                                    <h6>Email</h6>
                                    <p>
                                        <a href={`mailto:${CONTACT_INFO.email}`}>
                                            {CONTACT_INFO.email}
                                        </a>
                                    </p>
                                </div>
                                <div className="mb-3">
                                    <h6>Business Hours</h6>
                                    <p>
                                        {CONTACT_INFO.businessHours.weekdays}<br />
                                        {CONTACT_INFO.businessHours.saturday}<br />
                                        {CONTACT_INFO.businessHours.sunday}
                                    </p>
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