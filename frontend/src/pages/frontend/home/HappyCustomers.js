import { useEffect, useState } from "react";
import CountUp from 'react-countup';
import speaker from 'assets/pictures/happy-customers/speakers.png';
import events from 'assets/pictures/happy-customers/events.png';
import users from 'assets/pictures/happy-customers/users.png';
import tickets from 'assets/pictures/happy-customers/tickets.png';


export default function HappyCustomers() {


    return (
        <div className='my-5' id='happyCustomers-section'>
            <div className="absolute-layer"></div>
            <div className="container-fluid">
                <div className="container text-light">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-5">
                        <div className="col">
                            <CountUp
                                start={0}
                                end={250}
                                duration={2}
                                enableScrollSpy
                            >
                                {({ countUpRef }) => (
                                    <div className="text-center">
                                        <img src={speaker} width={80} alt="" />
                                        <h1 className="fw-bold text-info my-3">
                                            <span ref={countUpRef} />
                                        </h1>
                                        <h4>
                                            Best Speakers
                                        </h4>
                                    </div>
                                )}
                            </CountUp>
                        </div>
                        <div className="col">
                            <CountUp
                                start={0}
                                end={1500}
                                duration={2}
                                enableScrollSpy
                            >
                                {({ countUpRef }) => (
                                    <div className="text-center">
                                        <img src={events} width={80} alt="" />
                                        <h1 className="fw-bold text-info my-3">
                                            <span ref={countUpRef} />
                                        </h1>
                                        <h4>
                                            Total Events
                                        </h4>
                                    </div>
                                )}
                            </CountUp>
                        </div>
                        <div className="col">
                            <CountUp
                                start={0}
                                end={1700}
                                duration={2}
                                enableScrollSpy
                            >
                                {({ countUpRef }) => (
                                    <div className="text-center">
                                        <img src={users} width={80} alt="" />
                                        <h1 className="fw-bold text-info my-3">
                                            <span ref={countUpRef} />
                                        </h1>
                                        <h4>
                                            Total Users
                                        </h4>
                                    </div>
                                )}
                            </CountUp>
                        </div>
                        <div className="col">
                            <CountUp
                                start={0}
                                end={2300}
                                duration={2}
                                enableScrollSpy
                            >
                                {({ countUpRef }) => (
                                    <div className="text-center">
                                        <img src={tickets} width={80} alt="" />
                                        <h1 className="fw-bold text-info my-3">
                                            <span ref={countUpRef} />
                                        </h1>
                                        <h4>
                                            Tickets Sold
                                        </h4>
                                    </div>
                                )}
                            </CountUp>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
