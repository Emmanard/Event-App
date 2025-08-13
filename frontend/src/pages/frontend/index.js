// SOLUTION 2: Use a simpler route path to avoid conflicts entirely

// In your main routes file:
import { Route, Routes } from "react-router-dom";
import Home from "pages/frontend/home";
import About from "pages/frontend/about";
import EventDetails from "pages/frontend/eventDetails";
import Gallery from "pages/frontend/gallery";
import Blogs from "pages/frontend/blogs";
import Contact from "pages/frontend/contact";
import Upcoming from "pages/frontend/upcomingEvents";
import Categories from "pages/frontend/categories";
import PrivateRoute from "components/privateRoute/PrivateRoute";
import PaymentVerification from "./payment/index";
import MyEvents from "./dashboard/events/MyEvents";
import DashboardRoutes from './dashboard/Routes';

export default function index() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/category/:category" element={<Categories />} />
        <Route
          path="/event/:id"
          element={<PrivateRoute Component={EventDetails} />}
        />
        <Route path="/payment-verification" element={<PaymentVerification />} />
        <Route path="/payment/verify" element={<PaymentVerification />} />
        <Route 
          path='/my-events' 
          element={<PrivateRoute Component={MyEvents} />} 
        />
        <Route path="/dashboard/*" element={<PrivateRoute Component={DashboardRoutes} />} />
      </Routes>
    </>
  );
}

