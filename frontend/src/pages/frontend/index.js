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
        {/* FIXED: Use element prop instead of component, and match the redirect URL */}
        <Route path="/payment-verification" element={<PaymentVerification />} />
       
         <Route path='/myEvents' element={<MyEvents />} />
        {/* Optional: Add alternative route in case some systems use /payment/verify */}
        <Route path="/payment/verify" element={<PaymentVerification />} />
      </Routes>
    </>
  );
}