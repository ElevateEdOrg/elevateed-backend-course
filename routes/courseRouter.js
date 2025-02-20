const express = require('express');

const courseRouter= express.Router();

courseRouter.get('/', require('../controllers/courseController'));

module.exports=courseRouter;