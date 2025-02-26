

const express = require('express');
const { upload } = require('../config/multer/multer')
const asyncHandler = require("express-async-handler");
const { authenticate } = require('../utils/utils');

const { UploadLectureFiles ,createLecture} = require('../controllers/lectureController')

const lectureRouter = express.Router();

// courseRouter.get('/getcourses', asyncHandler(getAllCourses))

// courseRouter.post('/getcourses', authenticate(["instructor", "student"]), asyncHandler(getAllUsersCourses))

lectureRouter.post('/createlecture', authenticate(["instructor"]), asyncHandler(createLecture));

lectureRouter.post('/upload', authenticate(['instructor']), upload.fields([
    { name: "video_path", maxCount: 1 }, // Single banner image
    { name: "pdf_path"},
]), asyncHandler(UploadLectureFiles));

module.exports = lectureRouter;