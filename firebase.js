import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { 
getAuth 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { 
getFirestore 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const firebaseConfig = {

apiKey: "AIzaSyC2GgAJMbXUvGIF84EeVTvolJnvIaZagQ0",

authDomain: "ghana-connect-fc3e2.firebaseapp.com",

projectId: "ghana-connect-fc3e2",

storageBucket: "ghana-connect-fc3e2.firebasestorage.app",

messagingSenderId: "835108806293",

appId: "1:835108806293:web:7f5ee41e10b4272af4c59c"

};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);
