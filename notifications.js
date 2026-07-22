import { getMessaging, getToken } 
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging.js";

import { app } from "./firebase.js";


const messaging = getMessaging(app);



export async function enableNotifications(){


try{


const permission = await Notification.requestPermission();



if(permission !== "granted"){

console.log("Notification permission denied");

return;

}



const token = await getToken(

messaging,

{

vapidKey:
"BJKAducmpbMj4Lq5tWF7WCOTG_0Ffn3twm_oXXUCPoRP6Ac2DtsxAVoF1t24yMc-2AcQwWVLLPzQuptvS96csao"

}

);



if(token){


console.log(
"Notification token:",
token
);


}



}


catch(error){


console.log(
"Notification error:",
error
);


}


}
