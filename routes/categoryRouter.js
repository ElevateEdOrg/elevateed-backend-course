

const express = require('express');

const asyncHandler = require("express-async-handler");



const { getAllCategories } = require('../controllers/categoriesController')

const categoryRouter = express.Router();

categoryRouter.get('/', asyncHandler(getAllCategories));

module.exports = categoryRouter;