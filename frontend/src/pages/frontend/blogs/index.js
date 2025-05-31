import React, { useEffect } from 'react'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import BlogsComponent from 'components/blogs'
import './blog.scss'

export default function Blogs() {
    useEffect(() => {
        window.scroll(0, 0);
    }, [])

    return (
        <>
            <Navbar />
            <div style={{ paddingTop: '120px', minHeight: '70vh' }}>
                <div className="container">
                    <div className="row mb-5">
                        <div className="col">
                            <h5 className='text-center text-warning'>Blog</h5>
                            <h2 className='heading-stylling display-5'>LATEST BLOGS</h2>
                        </div>
                    </div>
                </div>
                <BlogsComponent />
            </div>
            <Footer />
        </>
    )
}
