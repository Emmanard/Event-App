import { Tooltip } from "antd";
import "./_footer.scss";
import { Link } from "react-router-dom";
import LocationOnTwoToneIcon from "@mui/icons-material/LocationOnTwoTone";
import EmailTwoToneIcon from "@mui/icons-material/EmailTwoTone";
import LocalPhoneTwoToneIcon from "@mui/icons-material/LocalPhoneTwoTone";
import moment from "moment";

export default function index() {
  const year = moment().year();
  return (
    <>
      <div className="bg-dark text-light" id="footer">
        <div className="container">
          <div className="row mb-4">
            <div className="col">
              <Link to="/" className="event-wave-logo text-light">
                EventWave
              </Link>
            </div>
          </div>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4  pb-3">
            <div className="col">
              <p>
                Discover unforgettable experiences, book your tickets, and
                create memories at our diverse events lineup!
              </p>
              <hr />
              <div className="d-flex">
                <Tooltip title="Facebook" className="me-2">
                  <Link
                    type="button"
                    className="btn btn-light btn-sm d-flex align-items-center"
                    to="https://www.facebook.com/UsmanArif09"
                    target="_blank"
                  >
                    <i
                      className="bx bxl-facebook bx-tada fs-4"
                      style={{ color: "#1773ea" }}
                    ></i>
                  </Link>
                </Tooltip>
                <Tooltip title="Portfolio" className="me-2">
                  <Link
                    type="button"
                    className="btn btn-light btn-sm d-flex align-items-center"
                    to="https://osman-arif.web.app/"
                    target="_blank"
                  >
                    <i
                      className="bx bx-briefcase bx-tada fs-4"
                      style={{ color: "#6f4242" }}
                    ></i>
                  </Link>
                </Tooltip>
                <Tooltip title="Instagram" className="me-2">
                  <Link
                    type="button"
                    className="btn btn-light btn-sm d-flex align-items-center"
                    to="https://www.instagram.com/usman_s_usman2913/"
                    target="_blank"
                  >
                    <i
                      className="bx bxl-instagram bx-tada fs-4"
                      style={{ color: "#bf3a55" }}
                    ></i>
                  </Link>
                </Tooltip>
                <Tooltip title="Github" className="me-2">
                  <Link
                    type="button"
                    className="btn btn-light btn-sm d-flex align-items-center"
                    to="https://github.com/MuhammadUsmanAnsari"
                    target="_blank"
                  >
                    <i
                      className="bx bxl-github bx-tada fs-4"
                      style={{ color: "#121212" }}
                    ></i>
                  </Link>
                </Tooltip>
              </div>
            </div>
            <div className="col mt-5 mt-md-0">
              <h4 className="mb-3">Quick Links</h4>
              <div>
                <Link to={"/"}>
                  <i className="bx bx-chevron-right bx-flashing"></i>
                  Home
                </Link>
              </div>
              <div>
                <Link to={"/about"}>
                  <i className="bx bx-chevron-right bx-flashing"></i>
                  About
                </Link>
              </div>
              <div>
                <Link>
                  <i className="bx bx-chevron-right bx-flashing"></i>
                  Events
                </Link>
              </div>
              <div>
                <Link>
                  <i className="bx bx-chevron-right bx-flashing"></i>
                  Gallery
                </Link>
              </div>
              <div>
                <Link>
                  <i className="bx bx-chevron-right bx-flashing"></i>
                  Speakers
                </Link>
              </div>
              <div>
                <Link>
                  <i className="bx bx-chevron-right bx-flashing"></i>
                  Blogs
                </Link>
              </div>
            </div>
            <div className="col mt-5 mt-md-4 mt-lg-0">
              <h4 className="mb-3 fw-bold text-warning">Recent Blogs</h4>
              {/* <p>Don't miss our feature update</p>
                            <div className="input-group ">
                                <input type="email" className="form-control shadow-none rounded-start-pill py-3" placeholder="Enter you email" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                                <button className="input-group-text btn btn-info d-flex align-items-center px-3" id="basic-addon2">
                                    <box-icon name='send' animation='flashing'></box-icon>
                                </button>
                            </div> */}
              <div className="row g-0">
                <div className="col-3">
                  <img
                    src="https://w7.pngwing.com/pngs/313/180/png-transparent-rock-concert-music-festival-rock-music-others-stage-performance-computer-wallpaper-thumbnail.png"
                    style={{ width: 50, height: 50 }}
                    alt="..."
                  />
                </div>
                <div className="col">
                  <p className="card-title">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  </p>
                  <div>
                    <span>
                      <i className="bx bx-calendar text-secondary me-1"></i>
                    </span>
                    <span
                      style={{ fontSize: "small" }}
                      className="text-secondary"
                    >
                      2024-02-12
                    </span>
                  </div>
                </div>
              </div>
              <hr />
              <div className="row g-0">
                <div className="col-3">
                  <img
                    src="https://w7.pngwing.com/pngs/313/180/png-transparent-rock-concert-music-festival-rock-music-others-stage-performance-computer-wallpaper-thumbnail.png"
                    style={{ width: 50, height: 50 }}
                    alt="..."
                  />
                </div>
                <div className="col">
                  <p className="card-title">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  </p>
                  <div>
                    <span>
                      <i className="bx bx-calendar text-secondary me-1"></i>
                    </span>
                    <span
                      style={{ fontSize: "small" }}
                      className="text-secondary"
                    >
                      2024-02-12
                    </span>
                  </div>
                </div>
              </div>
              <hr />
            </div>
            <div className="col mt-5 mt-md-4 mt-lg-0">
              <h4 className="mb-3 fw-bold text-warning">Contact</h4>
              <div className="row">
                <div className="col-2">
                  <LocationOnTwoToneIcon />
                </div>
                <div className="col-10">
                  <Link to="https://maps.app.goo.gl/TUBrjAABQX47Poj88">
                    2107-D Ghulamabad Faisalabad Pakistan
                  </Link>
                </div>
              </div>
              <div className="row my-2">
                <div className="col-2">
                  <LocalPhoneTwoToneIcon />
                </div>
                <div className="col-10">
                  <Link to="tel:+923007588836">+923007588836</Link>
                </div>
              </div>
              <div className="row ">
                <div className="col-2">
                  <EmailTwoToneIcon />
                </div>
                <div className="col-10">
                  <Link to="mailto:usmanarif2913@gmail.com">
                    usmanarif2913@gmail.com
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="row text-center pb-3">
            <div className="col">
              <p>Copyright &copy; {year}. All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
