import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const userPoolId = "us-east-1_PpZiaKLpu"

export const clientId= "7npnk7bc9gain1t9g4a4956atp"
 
const firebaseConfig = {
    apiKey: "AIzaSyARpxqAeAVeH_EyC6V3VPkwSVZhE9rNjTo",
    authDomain: "dalvacationhome-sdp-2.firebaseapp.com",
    projectId: "dalvacationhome-sdp-2",
    storageBucket: "dalvacationhome-sdp-2.appspot.com",
    messagingSenderId: "521114221538",
    appId: "1:521114221538:web:139704d42c7436900757bb",
    measurementId: "G-MGXCF07BVC"
};
 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
 
export { db };