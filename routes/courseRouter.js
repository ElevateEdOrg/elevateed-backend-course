

const express = require('express');
const { upload } = require('../config/multer/multer')
const asyncHandler = require("express-async-handler");
const { authenticate } = require('../utils/utils');

const { courseCreationController, getAllCourses, getAllUsersCourses, UploadCourseFiles } = require('../controllers/courseController')

const courseRouter = express.Router();

courseRouter.get('/getcourses', asyncHandler(getAllCourses))

courseRouter.post('/getcourses', authenticate(["instructor", "student"]), asyncHandler(getAllUsersCourses))

courseRouter.post('/createcourse', authenticate(["instructor"]), asyncHandler(courseCreationController));

courseRouter.post('/upload', authenticate(['instructor']), upload.fields([
    { name: "banner_image", maxCount: 1 }, // Single banner image
    { name: "intro_video", maxCount: 1 },
]), asyncHandler(UploadCourseFiles));

module.exports = courseRouter;