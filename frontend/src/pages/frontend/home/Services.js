import easy from 'assets/svg/services/easy.svg';
import free from 'assets/svg/services/free.svg';
import manage from 'assets/svg/services/manage.svg';
import multiple from 'assets/svg/services/multiple.svg';
import available from 'assets/svg/services/available.svg';
import location from 'assets/svg/services/location.svg';


export default function Services() {
    return (
        <div className="container mt-5 mt-sm-0" id="services-section">
            <div className="row">
                <div className="col">
                    <h5 className='text-center text-warning'>Services</h5>
                    <h2 className='heading-stylling display-5'>WHY CHOOSE US</h2>
                </div>
            </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 my-4 g-4">
                <div className="col">
                    <div className="card py-3 py-sm-5 px-4">
                        <div className="row">
                            <div className="col-12 col-sm-3">
                                <img src={easy} alt="" className='w-100' />
                            </div>
                            <div className="col">
                                <h4>Easy to use</h4>
                                <p>With intuitive interfaces and straightforward navigation, attending events and managing registrations has never been easier.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card py-3 py-sm-5 px-4">
                        <div className="row">
                            <div className="col-12 col-sm-3">
                                <img src={free} alt="" className='w-100' />
                            </div>
                            <div className="col">
                                <h4>Free registrations management</h4>
                                <p>Effortlessly manage registrations on our platform, enabling organizers to securely gather attendee details with ease.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card py-3 py-sm-5 px-4">
                        <div className="row">
                            <div className="col-12 col-sm-3">
                                <img src={manage} alt="" className='w-100' />
                            </div>
                            <div className="col">
                                <h4>event management</h4>
                                <p>Seamlessly plan and coordinate your events from start to finish with our comprehensive event management tools.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card py-3 py-sm-5 px-4">
                        <div className="row">
                            <div className="col-12 col-sm-3">
                                <img src={multiple} alt="" className='w-100' />
                            </div>
                            <div className="col">
                                <h4>multiple events</h4>
                                <p>Whether you're hosting a small gathering or a large-scale conference, our platform supports multiple events simultaneously.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card py-3 py-sm-5 px-4">
                        <div className="row">
                            <div className="col-12 col-sm-3">
                                <img src={available} alt="" className='w-100' />
                            </div>
                            <div className="col">
                                <h4>24/7 event availability</h4>
                                <p>With 24/7 availability, attendees can register and participate in events at their convenience, ensuring a flexible and inclusive experience for all.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card py-3 py-sm-5 px-4">
                        <div className="row">
                            <div className="col-12 col-sm-3">
                                <img src={location} alt="" className='w-100' />
                            </div>
                            <div className="col">
                                <h4>great locations</h4>
                                <p>Host or book your event in the most sought-after locations.our platform offers a diverse selection of top-tier locations to elevate your event experience.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
