import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.get("/",(req,res)=>{
    res.render("homepage.ejs");
})
app.listen(port,(req,res)=>{
    console.log(`Server listening on port ${port}.`);
})