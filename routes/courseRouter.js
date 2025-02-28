

const express = require('express');
const { upload } = require('../config/multer/multer')
const asyncHandler = require("express-async-handler");
const { authenticate } = require('../utils/utils');

const { createCourse, getAllCourses, getAllUsersCourses, uploadCourseFiles ,searchCourses,getTopInstuctors,
    getCourseBYId
} = require('../controllers/courseController')

const courseRouter = express.Router();

courseRouter.get('/getcourses', asyncHandler(getAllCourses))

courseRouter.get('/getcourses/:courseId', asyncHandler(getCourseBYId))

courseRouter.get('/searchcourse', asyncHandler(searchCourses))

courseRouter.get('/topinstructors', asyncHandler(getTopInstuctors))

courseRouter.post('/getcourses', authenticate(["instructor", "student"]), asyncHandler(getAllUsersCourses))

courseRouter.post('/createcourse', authenticate(["instructor"]), asyncHandler(createCourse));

courseRouter.post('/upload', authenticate(['instructor']), upload.fields([
    { name: "banner_image", maxCount: 1 }, // Single banner image
    { name: "intro_video", maxCount: 1 },
]), asyncHandler(uploadCourseFiles));

module.exports = courseRouter;