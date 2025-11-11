import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEBlb57tDmyU73uh4u6xgMwr8teTCkB0E",
  authDomain: "lavanderia-a250e.firebaseapp.com",
  projectId: "lavanderia-a250e",
  storageBucket: "lavanderia-a250e.firebasestorage.app",
  messagingSenderId: "571575885761",
  appId: "1:571575885761:web:e2bfed189403c6ab0ed940"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need
export const db = getFirestore(app);
export const auth = getAuth(app);