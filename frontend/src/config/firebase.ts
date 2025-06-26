import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4nDjrAW_iu0N3_-LnS__ymBQw_TWeByk",
  authDomain: "tipflow-80ff9.firebaseapp.com",
  projectId: "tipflow-80ff9",
  storageBucket: "tipflow-80ff9.firebasestorage.app",
  messagingSenderId: "533290504089",
  appId: "1:533290504089:web:3032a8036a2332b1018d08",
  measurementId: "G-7PY0CBR022"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;