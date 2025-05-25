
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
  apiKey: "AIzaSyB9spRMVq3mCothzuGef85fAqaRVHHLaBE",
  authDomain: "event-app-d50b5.firebaseapp.com",
  projectId: "event-app-d50b5",
  storageBucket: "event-app-d50b5.firebasestorage.app",
  messagingSenderId: "913591687151",
  appId: "1:913591687151:web:d7c9f3eea69b3df1b5081a",
  measurementId: "G-FJN6DHSP98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getAnalytics(app);
const storage = getStorage(app);


export { firestore, analytics, storage }

