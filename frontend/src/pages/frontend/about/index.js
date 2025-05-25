import Navbar from 'components/Navbar';
import Footer from 'components/Footer';
import './_about.scss';
import Banner from 'components/background/Banner';
import { useEffect } from 'react';
import Statements from './Statements';
import Services from 'pages/frontend/home/Services';
import Testimonial from '../home/Testimonial';

export default function Index() {
    useEffect(() => {
        window.scroll(0, 0);
    }, [])
    return (
        <>
            <Navbar />
            <Banner title={"ALL YOU NEED TO KNOW"} pageTitle={'About EventWave'} page={'About Us'} />
            <Statements />
            <Services />
            <div className="mt-5">
                <Testimonial />
            </div>
            <Footer />

        </>
    )
}
