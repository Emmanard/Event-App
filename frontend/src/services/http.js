import axios from "axios";

const apiKey = process.env.REACT_APP_APIKEY;

// Create axios instance
const api = axios.create();

// Set default headers
api.defaults.headers.post["Content-Type"] = "application/json";
api.defaults.headers.put["Content-Type"] = "application/json";
api.defaults.headers.common["apikey"] = apiKey;

// Request interceptor to dynamically add token
api.interceptors.request.use(
  (config) => {
    // Get fresh token from localStorage on each request
    const jwtoken = localStorage.getItem("jwtoken");
   
    if (jwtoken) {
      config.headers["jwtoken"] = jwtoken;
    }
    
    console.log('Headers after:', config.headers);
    console.log('Full config:', config);
    
    return config;
  },
  (error) => {
    console.log('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
   
    return response;
  },
  (error) => {
    console.log('❌ Response error:', error.response?.status, error.response?.data);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - token might be expired');
      // Optionally remove invalid token
      localStorage.removeItem("jwtoken");
      // You might want to redirect to login or show a message
      if (window.toastify) {
        window.toastify("Session expired. Please login again.", "error");
      }
    }
    return Promise.reject(error);
  }
);

export const sendImagesConfig = {
  "Content-Type": "multipart/form-data",
  get jwtoken() {
    return localStorage.getItem("jwtoken");
  },
  apikey: apiKey,
};

export const cancel = axios.CancelToken.source();
export const post = api.post;
export const put = api.put;
export const del = api.delete;
export const get = api.get;