import './App.scss';
import 'bootstrap/dist/js/bootstrap.bundle';
import 'boxicons/dist/boxicons';
import 'boxicons/css/boxicons.min.css';
import 'antd/dist/antd';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { BrowserRouter } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import Routes from 'routes/Routes';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import AuthContextProvider from 'context/AuthContext';


function App() {
  return (
    <div className='app'>
      <BrowserRouter >
        <AuthContextProvider>
          <ParallaxProvider>
            <Routes />
          </ParallaxProvider>
        </AuthContextProvider>
      </BrowserRouter>
      {/* toast container */}
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
