// WITHOUT LANGCHAIN

// import { GoogleGenAI } from "@google/genai";
// import express from "express";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// const port = 8000;

// app.use(express.json());



// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_APIKEY,
// });

// app.post("/ai", async (req, res) => {
//   try {
//     const { input } = req.body;

//     const resp = await ai.models.generateContent({
//       model: "gemini-3.6-flash",

//       config: {
//         systemInstruction: `
//           You are a personal AI assistant.
//           Your name is Saish.

//           Answer the user's questions accurately and clearly.

//           IMPORTANT RULE:
//           If you do not know the answer or you are not confident
//           that the answer is correct, do not guess or make up an answer.
//           Simply reply:
//           "Sorry, I don't know the answer to that."
//         `,
//       },

//       contents: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: input,
//             },
//           ],
//         },
//       ],
//     });

//     res.status(200).json({
//       response: resp.text,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Something went wrong",
//     });
//   }
// });


// app.get("/", (req, res) => {
//   res.status(200).json({
//     message: "Server is running",
//   });
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });



// WITH LANGCHAIN
import express from "express";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

const app = express();
const port = 8000;

app.use(express.json());


const LLM = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",  // ← Changed from gemini-2.5-pro
  apiKey: process.env.GOOGLE_API_KEY
});

app.post("/ai", async (req, res) => {
  try {
    const { input } = req.body;
    
    if (!input) {
      return res.status(400).json({ message: "Input is required" });
    }
    
    const response = await LLM.invoke(input);
    res.status(200).json({
      response: response.content,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running",
  });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});