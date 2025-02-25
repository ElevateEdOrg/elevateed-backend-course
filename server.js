require("dotenv").config();
const express = require("express");
const { sequelize } = require('./dbconn')
const path = require("path");
const app = express();

const { specs, swaggerUi } = require('./swagger');
const loginRouter = require('./routes/loginRouter')
const courseRouter = require('./routes/courseRouter')
const categoryRouter = require('./routes/categoryRouter')
const lectureRouter = require('./routes/LectureRouter')
const cors = require("cors");

const PORT = process.env.PORT || 8000;
const date = new Date();


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


app.use('/api/login', loginRouter);

app.use('/api/courses', courseRouter);
app.use('/api/lecture', lectureRouter);
app.use('/api/courses/categories', categoryRouter);

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(403).json({ message: "File size exceeds the 500MB limit!" });
  } else if (err.message === 'Invalid mimetype') {
    return res.status(403).json({ message: "Unsupported file type" });
  }
  res.status(500).json({ message: "server failed from main js" });
});

// app.all("*", (req, res) => {
//   res.status(404).json({ message: '404 invalid api endpoint used' })
// })


sequelize.sync()
  .then(() => {

    console.log(`postgres connected successfully`)
    app.listen(PORT, (err) => {
      err
        ? console.log(err)
        : console.log("server running " + ` http://localhost:` + PORT + "/");
    });
  })
  .catch(err => {
    console.error('Unable to start server:', err);
  });




