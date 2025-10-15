import { Tooltip } from "antd";
import { Link } from "react-router-dom";
import LocationOnTwoToneIcon from "@mui/icons-material/LocationOnTwoTone";
import EmailTwoToneIcon from "@mui/icons-material/EmailTwoTone";
import LocalPhoneTwoToneIcon from "@mui/icons-material/LocalPhoneTwoTone";
import "./_footer.scss";

const SOCIAL_LINKS = [
  { 
    icon: "bxl-github", 
    color: "#121212", 
    url: "https://github.com/Emmanard", 
    title: "Github" 
  },
  { 
    icon: "bxl-linkedin", 
    color: "#0077b5", 
    url: "https://www.linkedin.com/in/emmanuel-omunizua-80b380301/", 
    title: "LinkedIn" 
  },
  { 
    icon: "bx-briefcase", 
    color: "#6f4242", 
    url: "https://portfolio-site-2126.vercel.app/", 
    title: "Portfolio" 
  }
];

const QUICK_LINKS = [
   { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/blogs", label: "Blogs" },
  { to: "/contact", label: "Contact" }
];

const CONTACT_INFO = [
  { 
    Icon: LocationOnTwoToneIcon, 
    content: "Lagos, Nigeria", 
    href: "https://www.google.com/maps/place/Lagos,+Nigeria" 
  },
  { 
    Icon: LocalPhoneTwoToneIcon, 
    content: "+2348086804544", 
    href: "tel:+2348086804544" 
  },
  { 
    Icon: EmailTwoToneIcon, 
    content: "emmanuelomunizua@gmail.com", 
    href: "mailto:emmanuelomunizua@gmail.com" 
  }
];

const SocialLink = ({ icon, color, url, title }) => (
  <Tooltip title={title}>
    <Link
      to={url}
      target="_blank"
      className="btn btn-light btn-sm d-flex align-items-center me-2"
    >
      <i className={`bx ${icon} bx-tada fs-4`} style={{ color }} />
    </Link>
  </Tooltip>
);

export default function Footer() {
  return (
    <div className="bg-dark text-light" id="footer">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <Link to="/" className="event-wave-logo text-light">
              EventWave
            </Link>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 pb-3">
          {/* About Section */}
          <div className="col">
            <p>
              Discover unforgettable experiences, book your tickets, and create
              memories at our diverse events lineup!
            </p>
            <hr />
            <div className="d-flex">
              {SOCIAL_LINKS.map((link) => (
                <SocialLink key={link.title} {...link} />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col mt-5 mt-md-0">
            <h4 className="mb-3">Quick Links</h4>
            {QUICK_LINKS.map(({ to, label }) => (
              <div key={label}>
                <Link to={to}>
                  <i className="bx bx-chevron-right bx-flashing" />
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="col mt-5 mt-md-4 mt-lg-0">
            <h4 className="mb-3 fw-bold text-warning">Contact</h4>
            {CONTACT_INFO.map(({ Icon, content, href }, index) => (
              <div className="row my-2" key={index}>
                <div className="col-2">
                  <Icon />
                </div>
                <div className="col-10">
                  <Link to={href} target={index === 0 ? "_blank" : undefined}>
                    {content}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr />
        <div className="row text-center pb-3">
          <div className="col">
            <p>Copyright &copy; {new Date().getFullYear()}. All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}