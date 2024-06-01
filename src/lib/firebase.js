// Import the functions you need from the SDKs you need
import { getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA-Wnt6PiBN8IHWVn9o_pm-HsUB5obDaM",
  authDomain: "reactchat-f71f7.firebaseapp.com",
  projectId: "reactchat-f71f7",
  storageBucket: "reactchat-f71f7.appspot.com",
  messagingSenderId: "492412679125",
  appId: "1:492412679125:web:99fa055e620cf32d3bc35c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
