import express from "express";
import dotenv from "dotenv";
dotenv.config();

const port =process.env.PORT || 5000;
const app = express();
app.get ("/" ,(req,res)=> {
    res.status(200).json({message : "Hello  Saish from docker phase 2"});
})

app.listen(port,()=> {
    console.log(`Server is running on port ${port}`);
})