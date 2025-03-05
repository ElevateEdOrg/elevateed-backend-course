

const express = require('express');

const asyncHandler = require("express-async-handler");
const { authenticate } = require('../utils/utils');

const {getQuizData,updateScore,getCourseRecommendations} = require('../controllers/aiservicesController')

const aiserviceRouter = express.Router();

// courseRouter.get('/getcourses', asyncHandler(getAllCourses))

// courseRouter.post('/getcourses', authenticate(["instructor", "student"]), asyncHandler(getAllUsersCourses))

aiserviceRouter.get('/getquiz', authenticate(["student"]), asyncHandler(getQuizData));

aiserviceRouter.put('/updatescore/:courseId', authenticate(["student"]), asyncHandler(updateScore));

aiserviceRouter.get('/getrecommendations', authenticate(["student"]), asyncHandler(getCourseRecommendations));



module.exports = aiserviceRouter;