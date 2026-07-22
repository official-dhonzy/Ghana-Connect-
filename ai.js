import { getAI, getGenerativeModel, GoogleAIBackend } 
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-ai.js";

import { app } from "./firebase.js";


const ai = getAI(app, {
backend: new GoogleAIBackend()
});


const model = getGenerativeModel(ai, {
model: "gemini-2.5-flash"
});



export async function askGhanaAI(question){


const prompt = `

You are Ghana Connect AI.

Help people in Ghana with:

- jobs
- farming
- education
- business
- housing
- services
- local solutions

Question:
${question}

Give a helpful answer.

`;



const result =
await model.generateContent(prompt);


return result.response.text();


}
