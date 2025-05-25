import { Carousel } from "antd";
import { useAuthContext } from "context/AuthContext";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const { isAuthenticated, user } = useAuthContext();
  return (
    <>
      <div id="hero-section">
        <Carousel effect="fade" autoplay dotPosition="right">
          <div className="container">
            <div className="row">
              <div className="col">
                <h1>Worldwide Music Concert</h1>
                <h4>Explore, Book, Enjoy - Your Event Journey Begins Here</h4>
                <div className="row row-cols-1 row-cols-sm-2">
                  <div className="col text-center text-sm-end">
                    <Link
                      className="button-stylling px-5 py-3 rounded bg-info border-0"
                      to={"/about"}
                    >
                      <span className="text">About Us</span>
                      <span>Learn More</span>
                    </Link>
                  </div>
                  <div className="col text-center text-sm-start mt-3 mt-sm-0">
                    <button className="button-stylling-outline px-5 py-3 rounded bg-transparent">
                      <span className="text">Get Started</span>
                      <span>Let's Start</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col">
                <h1>Global Party Events</h1>
                <h4>Explore, Book, Enjoy - Your Event Journey Begins Here</h4>
                <div className="row row-cols-1 row-cols-sm-2">
                  <div className="col text-center text-sm-end">
                    <Link
                      className="button-stylling px-5 py-3 rounded bg-info border-0"
                      to={"/about"}
                    >
                      <span className="text">About Us</span>
                      <span>Learn More</span>
                    </Link>
                  </div>
                  <div className="col text-center text-sm-start mt-3 mt-sm-0">
                    <button className="button-stylling-outline px-5 py-3 rounded bg-transparent">
                      <span className="text">Get Started</span>
                      <span>Let's Start</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col">
                <h1>Celebration of Marriage</h1>
                <h4>Explore, Book, Enjoy - Your Event Journey Begins Here</h4>
                <div className="row row-cols-1 row-cols-sm-2">
                  <div className="col text-center text-sm-end">
                    <Link
                      className="button-stylling px-5 py-3 rounded bg-info border-0"
                      to={"/about"}
                    >
                      <span className="text">About Us</span>
                      <span>Learn More</span>
                    </Link>
                  </div>
                  <div className="col text-center text-sm-start mt-3 mt-sm-0">
                    <button className="button-stylling-outline px-5 py-3 rounded bg-transparent">
                      <span className="text">Get Started</span>
                      <span>Let's Start</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col">
                <h1>Crafting Magical Birthdays</h1>
                <h4>Explore, Book, Enjoy - Your Event Journey Begins Here</h4>
                <div className="row row-cols-1 row-cols-sm-2">
                  <div className="col text-center text-sm-end">
                    <Link
                      className="button-stylling px-5 py-3 rounded bg-info border-0"
                      to={"/about"}
                    >
                      <span className="text">About Us</span>
                      <span>Learn More</span>
                    </Link>
                  </div>
                  <div className="col text-center text-sm-start mt-3 mt-sm-0">
                    <button className="button-stylling-outline px-5 py-3 rounded bg-transparent">
                      <span className="text">Get Started</span>
                      <span>Let's Start</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col">
                <h1>Let's Explore Together</h1>
                <h4>Explore, Book, Enjoy - Your Event Journey Begins Here</h4>
                <div className="row row-cols-1 row-cols-sm-2">
                  <div className="col text-center text-sm-end">
                    <Link
                      className="button-stylling px-5 py-3 rounded bg-info border-0"
                      to={"/about"}
                    >
                      <span className="text">About Us</span>
                      <span>Learn More</span>
                    </Link>
                  </div>
                  <div className="col text-center text-sm-start mt-3 mt-sm-0">
                    <button className="button-stylling-outline px-5 py-3 rounded bg-transparent">
                      <span className="text">Get Started</span>
                      <span>Let's Start</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Carousel>
        {/* 


            <div id="carouselExample" className="carousel slide bg-info">
                <div className="carousel-inner">
                    <div className="carousel-item active">

                    </div>
                    <div className="carousel-item">

                    </div>
                    <div className="carousel-item">
                        <img src="..." className="d-block w-100" alt="..." />
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div> */}
      </div>
    </>
  );
}
