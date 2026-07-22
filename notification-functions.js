import { db } from "./firebase.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


export async function createNotification(userId, message){


await addDoc(

collection(db,"notifications"),

{

userId:userId,

message:message,

date:new Date()

}

);


}
