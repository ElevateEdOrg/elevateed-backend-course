

const express = require('express');
const { upload } = require('../config/multer/multer')
const asyncHandler = require("express-async-handler");
const { authenticate } = require('../utils/utils');

const { UploadLectureFiles, createLecture, updateLecture, deleteLecture, updatelectureStatus } = require('../controllers/lectureController')

const lectureRouter = express.Router();

// courseRouter.get('/getcourses', asyncHandler(getAllCourses))

// courseRouter.post('/getcourses', authenticate(["instructor", "student"]), asyncHandler(getAllUsersCourses))

lectureRouter.post('/createlecture', authenticate(["instructor"]), asyncHandler(createLecture));

lectureRouter.put("/update/:lectureId", authenticate(["instructor"]), asyncHandler(updateLecture));

lectureRouter.delete("/delete/:lectureId", authenticate(["instructor"]), asyncHandler(deleteLecture));

lectureRouter.post("/updatestatus/:lectureId", authenticate(["student"]), asyncHandler(updatelectureStatus));

lectureRouter.post('/upload', authenticate(['instructor']), upload.fields([
    { name: "video_path", maxCount: 1 }, // Single banner image
    { name: "pdf_path" },
]), asyncHandler(UploadLectureFiles));

module.exports = lectureRouter;