const express = require('express');
const multer = require("multer");
const asyncHandler = require("express-async-handler");
const {isInstructor} = require('../utils/utils');

const upload = multer({ storage: multer.memoryStorage() });

const {courseCreationController} = require('../controllers/courseController')

const courseRouter= express.Router();

courseRouter.post('/',upload.single("file"),isInstructor,asyncHandler(courseCreationController));

module.exports=courseRouter;