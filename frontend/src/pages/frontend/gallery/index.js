import React, { useEffect, useState } from 'react'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import './gallery.scss'

export default function Gallery() {
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
                            <h5 className='text-center text-warning'>Gallery</h5>
                            <h2 className='heading-stylling display-5'>EVENT GALLERY</h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <p className="text-center">Gallery section coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
