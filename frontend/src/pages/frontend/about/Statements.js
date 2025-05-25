import { Link } from "react-router-dom";

export default function Statements() {
    return (
        <div className='container-fluid bg-body-tertiary mb-5' id='statements-section'>
            <div className="container">
                <div className="row row-cols-1 row-cols-md-3">
                    <div className="col">
                        <h5 className="text-secondary mb-3">WE ARE EVENTWAVE</h5>
                        <h2><span className="fw-bold">No.1</span> Events Management</h2>
                        <div>
                            <Link className='button-stylling-1 px-5 mt-4' to="/auth/login">GET STARTED!</Link>
                        </div>

                    </div>
                    <div className="col mt-5 mt-md-0 mb-3 mb-md-0">
                        <h2>Our Mission <span className="text-warning">___</span></h2>
                        <p className="mt-4 text-secondary" style={{ textAlign: "justify" }}>At EventWave, our mission is to empower individuals and organizations to create unforgettable experiences through seamless event management solutions. We strive to provide innovative tools and unparalleled support to enable our users to orchestrate successful events that leave a lasting impact on attendees and communities alike.</p>
                    </div>
                    <div className="col">
                        <h2>Our Vision <span className="text-warning">___</span></h2>
                        <p className="mt-4 text-secondary" style={{ textAlign: "justify" }}>Our vision at EventWave is to revolutionize the event management industry by fostering a dynamic and inclusive platform where creativity thrives and connections flourish. We envision a future where organizing and attending events is a seamless and enriching experience, enabling individuals and businesses to celebrate, learn, and grow together in a digital age.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
