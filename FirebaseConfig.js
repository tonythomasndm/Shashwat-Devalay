
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
    apiKey: "AIzaSyAilaYYgT2dDwl-pj3VSD138bsV6A7l_WE",
    authDomain: "ip-matchmaking.firebaseapp.com",
    databaseURL: "https://ip-matchmaking-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ip-matchmaking",
    storageBucket: "ip-matchmaking.appspot.com",
    messagingSenderId: "1047692180149",
    appId: "1:1047692180149:web:de682e979bad5151e0dcfc",
    measurementId: "G-BWZFK1RSRM"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});