import { Route, Routes } from 'react-router-dom'
import Home from 'pages/frontend/home'
import About from 'pages/frontend/about'
import EventDetails from 'pages/frontend/eventDetails'
import Gallery from 'pages/frontend/gallery'
import Blogs from 'pages/frontend/blogs'
import Contact from 'pages/frontend/contact'
import Upcoming from 'pages/frontend/upcomingEvents'
import Categories from 'pages/frontend/categories'
import PrivateRoute from 'components/privateRoute/PrivateRoute'

export default function index() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/upcoming' element={<Upcoming />} />
        <Route path='/gallery' element={<Gallery />} />
        <Route path='/blogs' element={<Blogs />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/categories/:category' element={<Categories />} />
        <Route path='/event/details/:id' element={<PrivateRoute Component={EventDetails} />} />
      </Routes>
    </>
  )
}