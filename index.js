import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
//Add your API key here
const yourApiKey = "b2063b04d0f16384a004d53a4b2d7f72";
app.use(bodyParser.urlencoded({ extended: true }));
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
let time;
let month;
let day;
let date;
let hour;
let hoursIn12HrFormat;
let minutes;
let ampm;
let dateMinAmPm;
let dayDate;
// To update the timer for every 1 second we kept in setInterval.

setInterval(() => {
  time = new Date();
  month = time.getMonth();
  date = time.getDate();
  day = time.getDay();
  hour = time.getHours();
  hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
  minutes = time.getMinutes();
  ampm = hour >= 12 ? "PM" : "AM";
  dateMinAmPm =
    hoursIn12HrFormat + ":" + (minutes < 10 ? "0" : "") + minutes + " " + ampm;
  dayDate = days[day] + ", " + date + " " + months[month];
}, 1000);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", { dateMinAmPm: dateMinAmPm, dayDate: dayDate });
});

app.post("/get-whether", async (req, res) => {
  const lati = req.body.lati;
  const longi = req.body.longi;
  // console.log(
  //   `https://api.openweathermap.org/data/2.5/weather?lat=${lati}&lon=${longi}&appid=${yourApiKey}`
  // );

  //This URL is for getting the current weather data
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lati}&lon=${longi}&appid=${yourApiKey}&units=metric`;

  //This URL is for getting the forecast data for every 3 hours
  const url_daily = `https://api.openweathermap.org/data/2.5/forecast?lat=${lati}&lon=${longi}&appid=${yourApiKey}&units=metric`;

  //This try block will call the current weather data
  try {
    const result = await axios.post(url);
    console.log("Hi");
    console.log(result);

    //console.log(result.data);
    const weatherData = result.data;
    //// Extract the relevant weather parameters
    const humidity = weatherData.main.humidity;
    const pressure = weatherData.main.pressure;
    const windSpeed = weatherData.wind.speed;
    const placeName = weatherData.name;
    const description = weatherData.weather[0].description;
    const temperature = weatherData.main.temp;
    let tomorrowDescription12 = [];
    let tomorrowDescription3 = [];
    let tomorrowDescription6 = [];
    let tomorrowDescription9 = [];
    let tomorrowDescription12p = [];
    let tomorrowDescription3p = [];
    let tomorrowDescription9p = [];
    let differentDayIndices = [];
    //This try block is inside another try block this try block will get future forecast data.
    try {
      const dailyResult = await axios.post(url_daily);
      // console.log(dailyResult.data.list[1].main.temp);
      //This function will take dailyResult as an argument and extract all the neccessary data inside the function and give those results.
      differentDayIndices = dataForecastExtraction(dailyResult); //function call

      console.log(
        dailyResult.data.list[differentDayIndices[0]].weather[0].description
      );

      tomorrowDescription12[0] =
        dailyResult.data.list[differentDayIndices[0]].weather[0].description;
      tomorrowDescription12[1] =
        dailyResult.data.list[differentDayIndices[0]].weather[0].icon;

      tomorrowDescription3[0] =
        dailyResult.data.list[differentDayIndices[1]].weather[0].description;
      tomorrowDescription3[1] =
        dailyResult.data.list[differentDayIndices[1]].weather[0].icon;

      tomorrowDescription6[0] =
        dailyResult.data.list[differentDayIndices[2]].weather[0].description;
      tomorrowDescription6[1] =
        dailyResult.data.list[differentDayIndices[2]].weather[0].icon;

      tomorrowDescription9[0] =
        dailyResult.data.list[differentDayIndices[3]].weather[0].description;
      tomorrowDescription9[1] =
        dailyResult.data.list[differentDayIndices[3]].weather[0].icon;

      tomorrowDescription12p[0] =
        dailyResult.data.list[differentDayIndices[4]].weather[0].description;
      tomorrowDescription12p[1] =
        dailyResult.data.list[differentDayIndices[4]].weather[0].icon;

      tomorrowDescription3p[0] =
        dailyResult.data.list[differentDayIndices[5]].weather[0].description;
      tomorrowDescription3p[1] =
        dailyResult.data.list[differentDayIndices[5]].weather[0].icon;

      tomorrowDescription9p =
        dailyResult.data.list[differentDayIndices[7]].main.temp;
    } catch (error) {
      //res.render("index.ejs", { content: JSON.stringify(error.response.data) });
      console.log(error.message);
      res.status(500).send("Error fetching weather data.");
    }
    res.render("index.ejs", {
      humidity: humidity,
      pressure: pressure,
      windSpeed: windSpeed,
      dateMinAmPm: dateMinAmPm,
      dayDate: dayDate,
      placeName,
      description: description,
      temp: temperature,
      tomorrowDescription12: tomorrowDescription12[0],
      tomorrowDescription12p: tomorrowDescription12p[0],
      tomorrowDescription3: tomorrowDescription3[0],
      tomorrowDescription3p: tomorrowDescription3p[0],
      tomorrowDescription6: tomorrowDescription6[0],
      tomorrowDescription9: tomorrowDescription9[0],
      tomorrowDescription9p: tomorrowDescription9p,
      icon3p: tomorrowDescription3p[1],
      icon3: tomorrowDescription3[1],
      icon12: tomorrowDescription12[1],
      icon12p: tomorrowDescription12p[1],
      icon6: tomorrowDescription6[1],
      icon9: tomorrowDescription9[1],
    });
    // console.log("Humidity:", humidity);
    // console.log("Pressure:", pressure);
    // console.log("Wind Speed:", windSpeed);
  } catch (error) {
    //res.render("index.ejs", { content: JSON.stringify(error.response.data) });
    console.log(error.message);
    res.status(500).send("Error fetching weather data.");
  }
});

app.post("/get-whether-place", async (req, res) => {
  const placeName = req.body.placeName;
  console.log(
    `https://api.openweathermap.org/data/2.5/weather?q=${placeName}&appid=${yourApiKey}`
  );
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${placeName}&appid=${yourApiKey}&units=metric`;
  //This URL is for getting the forecast data for every 3 hours
  const url_daily = `https://api.openweathermap.org/data/2.5/forecast?q=${placeName}&appid=${yourApiKey}&units=metric`;

  try {
    const result = await axios.post(url);
    console.log(result.data);
    const weatherData = result.data;
    //// Extract the relevant weather parameters
    const humidity = weatherData.main.humidity;
    const pressure = weatherData.main.pressure;
    const windSpeed = weatherData.wind.speed;
    const placeName = weatherData.name;
    const description = weatherData.weather[0].description;
    const temperature = weatherData.main.temp;

    let tomorrowDescription12 = [];
    let tomorrowDescription3 = [];
    let tomorrowDescription6 = [];
    let tomorrowDescription9 = [];
    let tomorrowDescription12p = [];
    let tomorrowDescription3p = [];
    let tomorrowDescription9p = [];
    let differentDayIndices = [];
    //This try block is inside another try block this try block will get future forecast data.
    try {
      const dailyResult = await axios.post(url_daily);
      console.log(dailyResult.data.list[1].main.temp);
      //This function will take dailyResult as an argument and extract all the neccessary data inside the function and give those results.
      differentDayIndices = dataForecastExtraction(dailyResult); //function call
      console.log("call function executed properly");

      console.log(
        dailyResult.data.list[differentDayIndices[0]].weather[0].description
      );

      tomorrowDescription12[0] =
        dailyResult.data.list[differentDayIndices[0]].weather[0].description;
      tomorrowDescription12[1] =
        dailyResult.data.list[differentDayIndices[0]].weather[0].icon;

      tomorrowDescription3[0] =
        dailyResult.data.list[differentDayIndices[1]].weather[0].description;
      tomorrowDescription3[1] =
        dailyResult.data.list[differentDayIndices[1]].weather[0].icon;

      tomorrowDescription6[0] =
        dailyResult.data.list[differentDayIndices[2]].weather[0].description;
      tomorrowDescription6[1] =
        dailyResult.data.list[differentDayIndices[2]].weather[0].icon;

      tomorrowDescription9[0] =
        dailyResult.data.list[differentDayIndices[3]].weather[0].description;
      tomorrowDescription9[1] =
        dailyResult.data.list[differentDayIndices[3]].weather[0].icon;

      tomorrowDescription12p[0] =
        dailyResult.data.list[differentDayIndices[4]].weather[0].description;
      tomorrowDescription12p[1] =
        dailyResult.data.list[differentDayIndices[4]].weather[0].icon;

      tomorrowDescription3p[0] =
        dailyResult.data.list[differentDayIndices[5]].weather[0].description;
      tomorrowDescription3p[1] =
        dailyResult.data.list[differentDayIndices[5]].weather[0].icon;

      tomorrowDescription9p =
        dailyResult.data.list[differentDayIndices[7]].main.temp;
      console.log("Inside try block executed properly");
    } catch (error) {
      //res.render("index.ejs", { content: JSON.stringify(error.response.data) });
      console.log(error.message);
      res.status(500).send("Error fetching weather data.");
      console.log("catch executed is properly");
    }
    res.render("index.ejs", {
      humidity: humidity,
      pressure: pressure,
      windSpeed: windSpeed,
      dateMinAmPm: dateMinAmPm,
      dayDate: dayDate,
      placeName,
      description: description,
      tomorrowDescription12: tomorrowDescription12[0],
      tomorrowDescription12p: tomorrowDescription12p[0],
      tomorrowDescription3: tomorrowDescription3[0],
      tomorrowDescription3p: tomorrowDescription3p[0],
      tomorrowDescription6: tomorrowDescription6[0],
      tomorrowDescription9: tomorrowDescription9[0],
      tomorrowDescription9p: tomorrowDescription9p,
      icon3p: tomorrowDescription3p[1],
      icon3: tomorrowDescription3[1],
      icon12: tomorrowDescription12[1],
      icon12p: tomorrowDescription12p[1],
      icon6: tomorrowDescription6[1],
      icon9: tomorrowDescription9[1],
      temp: temperature,
    });
    console.log("Humidity:", humidity);
    console.log("Pressure:", pressure);
    console.log("Wind Speed:", windSpeed);
    console.log("status is:", description);
  } catch (error) {
    //res.render("index.ejs", { content: JSON.stringify(error.response.data) });
    console.log(error.message);
    res.status(500).send("Error fetching weather data.");
  }
});

// This function will be called from nexted try block of post method with an end point of /get-weather end point and it will extract all the neccessary information from the dailyResult.

function dataForecastExtraction(dailyResult) {
  const today = new Date().getDate(); // Get today's date
  const dailyForecastResult = dailyResult.data.list;
  const differentDayIndices = [];
  for (let i = 0; i < dailyForecastResult.length; i++) {
    const forecastDate = new Date(dailyForecastResult[i].dt_txt).getDate();
    if (forecastDate != today) {
      differentDayIndices.push(i); // Store the index in the array
    }
  }
  return differentDayIndices;
}

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
