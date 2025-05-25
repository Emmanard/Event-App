import { Routes, Route } from 'react-router-dom'
import AddEvent from './AddEvent';
import MyEvents from './MyEvents';
import EditEvent from './EditEvent';

export default function index() {
    return (
        <>
            <Routes>
                <Route path='/add' element={<AddEvent />} />
                <Route path='/edit/:id' element={<EditEvent />} />
                <Route path='/myEvents' element={<MyEvents />} />
            </Routes>
        </>
    )
}
