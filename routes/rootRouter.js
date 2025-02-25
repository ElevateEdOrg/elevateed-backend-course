const express = require('express');

const rootRouter= express.Router();

rootRouter.get('/', require('../controllers/rootController'));

module.exports= rootRouter;