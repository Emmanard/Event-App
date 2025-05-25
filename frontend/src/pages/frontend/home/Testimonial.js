import { SwiperSlide, Swiper } from "swiper/react";
import { Pagination, Navigation, Parallax, Autoplay } from 'swiper/modules';
import commas from 'assets/svg/commas.svg'

const initialTestimonials = [
    {
        profilPic: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-614810.jpg&fm=jpg",
        name: "Usman",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis quod in facere reiciendis voluptatibus ex molestiae quaerat animi delectus autem nostrum aliquam perspiciatis temporibus, omnis eveniet mollitia, obcaecati quidem earum.",
        date: "2024-02-12",
        profession: "Web Developer"
    },
    {
        profilPic: "https://st3.depositphotos.com/1017228/18878/i/450/depositphotos_188781580-stock-photo-handsome-cheerful-young-man-standing.jpg",
        name: "Usman",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis quod in facere reiciendis voluptatibus ex molestiae quaerat animi delectus autem nostrum aliquam perspiciatis temporibus, omnis eveniet mollitia, obcaecati quidem earum.",
        date: "2024-02-12",
        profession: "Web Developer"
    },
    {
        profilPic: "https://st3.depositphotos.com/1017228/18878/i/450/depositphotos_188781580-stock-photo-handsome-cheerful-young-man-standing.jpg",
        name: "Usman",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis quod in facere reiciendis voluptatibus ex molestiae quaerat animi delectus autem nostrum aliquam perspiciatis temporibus, omnis eveniet mollitia, obcaecati quidem earum.",
        date: "2024-02-12",
        profession: "Web Developer"
    },
    {
        profilPic: "https://st3.depositphotos.com/1017228/18878/i/450/depositphotos_188781580-stock-photo-handsome-cheerful-young-man-standing.jpg",
        name: "Usman",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis quod in facere reiciendis voluptatibus ex molestiae quaerat animi delectus autem nostrum aliquam perspiciatis temporibus, omnis eveniet mollitia, obcaecati quidem earum.",
        date: "2024-02-12",
        profession: "Web Developer"
    },
    {
        profilPic: "https://st3.depositphotos.com/1017228/18878/i/450/depositphotos_188781580-stock-photo-handsome-cheerful-young-man-standing.jpg",
        name: "Usman",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis quod in facere reiciendis voluptatibus ex molestiae quaerat animi delectus autem nostrum aliquam perspiciatis temporibus, omnis eveniet mollitia, obcaecati quidem earum.",
        date: "2024-02-12",
        profession: "Web Developer"
    },
    {
        profilPic: "https://st3.depositphotos.com/1017228/18878/i/450/depositphotos_188781580-stock-photo-handsome-cheerful-young-man-standing.jpg",
        name: "Usman",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis quod in facere reiciendis voluptatibus ex molestiae quaerat animi delectus autem nostrum aliquam perspiciatis temporibus, omnis eveniet mollitia, obcaecati quidem earum.",
        date: "2024-02-12",
        profession: "Web Developer"
    },
]

export default function Testimonial() {
    return (
        <div className="container" id="testimonial-section">
            <div className="row mt-3 mb-5">
                <div className="col">
                    <h5 className='text-center text-warning'>Testimonial</h5>
                    <h2 className='heading-stylling display-5'>PEOPLE REVIEWS</h2>
                </div>
            </div>
            <div className="row row-cols-1 row-cols-md-2 mb-5 pt-3 pb-4">
                <div className="col d-flex flex-column justify-content-center">
                    <h2 className="fw-bold mb-4">WHAT PEOPLE SAY ABOUT EVENTWAVE.</h2>
                    <p>Our clients' experiences speak volumes about our commitment to excellence in event management. Here at EventWave, we take pride in delivering memorable events that exceed expectations.</p>
                </div>
                <div className="col">
                    <Swiper
                        pagination={{
                            type: 'fraction',
                        }}
                        speed={600}
                        parallax={true}
                        navigation={true}
                        autoplay
                        modules={[Pagination, Navigation, Parallax, Autoplay]}
                        className="mySwiper"
                    >
                        {initialTestimonials.map((item, i) => {
                            return <SwiperSlide key={i}>
                                <div className="card rounded-4 overflow-hidden border-0">
                                    <div className="row g-0" >
                                        <div className="col-4 col-sm-3">
                                            <div className="profile-pic">
                                                <img src={item.profilPic} className="img-fluid" alt="" />
                                            </div>
                                        </div>
                                        <div className="col d-flex flex-column justify-content-center ms-4">
                                            <img src={commas} alt="" />
                                            <h4 data-swiper-parallax="-300">{item.name}</h4>
                                            <h6 data-swiper-parallax="-200">{item.profession}</h6>
                                        </div>
                                    </div>
                                    <div className="container my-4 px-3 px-lg-5= py-2 py-lg-4">
                                        <div className="row">
                                            <div className="col" data-swiper-parallax="-100">
                                                {item.message}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        })}
                    </Swiper>
                </div>
            </div>
        </div>
    )
}
