require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const path = require("path");
const app = express();

const { specs, swaggerUi } = require('./swagger');


const cors = require("cors");

const PORT = process.env.PORT || 8000;
const date = new Date();

mongoose
  .connect(process.env.MONGO_URI)
  .then((data) => {
    console.log("DB connected successfully");
    app.listen(PORT, (err) => {
      err
        ? console.log(err)
        : console.log("server running " + ` http://localhost:` + PORT + "/");
    });
  })
  .catch((err) => {
    console.log(err);
  });
app.all("*", (req, res, next) => {
  const date = new Date();
  console.log(
    `--> url:${req.url} status:${res.statusCode} ${date.toLocaleTimeString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata", // Indian Standard Time (IST)
        hour12: false, // Use 24-hour format
        weekday: "short", // Show abbreviated weekday name
        year: "numeric", // Show full year
        month: "short", // Show abbreviated month name
        day: "numeric", // Show day of the month
        hour: "2-digit", // Show hours in 2-digit format
        minute: "2-digit", // Show minutes in 2-digit format
        second: "2-digit", // Show seconds in 2-digit format
      }
    )}`
  );
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/rootRouter'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.all("*", (req, res) => {
  res.status(404).json({ message: '404 invalid api endpoint used' })
})





