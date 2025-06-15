import React, { useEffect } from 'react'
import HeroSection from './HeroSection'
import './_home.scss'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import PopularEvents from './PopularEvents'
import HappyCustomers from './HappyCustomers'
import Speakers from './Speakers'
import Testimonial from './Testimonial'
import Blogs from 'components/blogs'
import Newsletter from 'components/NewsLetter'
import Services from './Services'

export default function Index() {
    useEffect(() => {
        window.scroll(0, 0);
    }, [])
    return (
        <>
            <Navbar />
            <HeroSection />
            <Services />
            <PopularEvents />
            <HappyCustomers />
            <Speakers />
            <Testimonial />
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h5 className='text-center text-warning'>Blog</h5>
                        <h2 className='heading-stylling display-5'>LATEST BLOGS</h2>
                    </div>
                </div>
            </div>
            <Blogs />
            <Newsletter />
            <Footer />

        </>
    )
}
