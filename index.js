import express from "express";
import axios from "axios";
import fs from 'fs';
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({extended:true}));

// Api Key
const API_KEY = (fs.readFileSync("./apikey.txt")).toString();

app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("homepage.ejs");
})

app.get("/searchlocation",(req,res)=>{
    res.render("search_location.ejs");
})

app.post("/locations",async (req,res)=>{
    const search = req.body.location;
    try{
    const result = await axios.get("http://api.openweathermap.org/geo/1.0/direct",
        {params:{
            q : search,
            appid :API_KEY,
            limit : 5
        }});

        const locations = result.data;
        if(result.data.length === 0){
            res.render("search_location.ejs",{notFound : true});
        }
        else{
            res.render("locations.ejs",{locations : locations})
        }
    }
    catch (err){
        res.render("search_location.ejs",{notFound : true});
    }
})

var city;
var state;
var country;

async function getLocationName(latitude,longitude){
    var name;
    const result = await axios.get("http://api.openweathermap.org/geo/1.0/reverse",
        {params:{
            lat : latitude,
            lon : longitude,
            appid :API_KEY,
            limit : 1
        }});
        const data = result.data[0];
        if(data){
            name = data.name;
            city=name;
            if(data.state){
                name = name + ", " + data.state;
                state=data.state;
            }
            name = name + ", " + data.country;
            country = data.country;
        }
        else{
            name = "Unnamed Location"
            city = "Unnamed Location"
        }
    return name;
}

app.post("/confirmlocation",async (req,res)=>{
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    var name = req.body.location;
    if(!name){
        const result = await axios.get("http://api.openweathermap.org/geo/1.0/reverse",
                    {params:{
                        lat : latitude,
                        lon : longitude,
                        appid :API_KEY,
                        limit : 1
                    }});
                const data = result.data[0];
                if(data){
                    name = data.name;
                    city=name;
                    if(data.state){
                        name = name + ", " + data.state;
                        state=data.state;
                    }
                    name = name + ", " + data.country;
                    country = data.country;
                }
                else{
                    name = "Unnamed Location"
                    city = "Unnamed Location"
                }
            }
    res.render("confirmlocation.ejs",
        {
            location : name,
            latitude : latitude,   
            longitude : longitude
        }
    )

})

app.post("/locationdata",async (req,res)=>{
    const location = req.body.location;
    const result = await axios.get("http://api.openweathermap.org/geo/1.0/direct",
        {params:{
            q : location,
            appid :API_KEY,
            limit : 5
        }});
    const latitude = result.data[0].lat;
    const longitude = result.data[0].lon;
    getLocationName(latitude,longitude);
    res.render("confirmlocation.ejs",
        {
            location : location,
            latitude : latitude,   
            longitude : longitude
        }
    )
})

app.post("/weather",async (req,res)=>{
    const location = req.body.location;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const result = await axios.get("https://api.openweathermap.org/data/2.5/weather",
        {params:{
            lat : latitude,
            lon : longitude,
            appid :API_KEY,
            units : "metric"
        }});
    const data = result.data;
    res.render("weather.ejs",{
        city : city,
        state : state,
        country : country,
        latitude : latitude,
        longitude : longitude,
        data : data
    })
})


app.listen(port,(req,res)=>{
    console.log(`Server listening on port ${port}.`);
})