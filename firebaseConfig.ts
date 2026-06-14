import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4vkTXIb6w4U-_1VrfiT7Js_MEFT-huaE",
  authDomain: "geoweather-mobile.firebaseapp.com",
  projectId: "geoweather-mobile",
  storageBucket: "geoweather-mobile.firebasestorage.app",
  messagingSenderId: "440007672109",
  appId: "1:440007672109:web:aef04975855b818f5a93a4",
  measurementId: "G-4R0JDFXNC7"
};

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;