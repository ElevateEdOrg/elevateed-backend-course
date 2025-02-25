/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns an access token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "emma@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email:
 *                       type: string
 *                 access:
 *                   type: string
 *                   description: JWT token for authentication
 *       401:
 *         description: Unauthorized - Invalid credentials or empty request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "wrong credentials"
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/login/check-token:
 *   get:
 *     summary: Check token authenticity
 *     description: Validates if the provided token in the Authorization header is authentic.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []  # Automatically adds "Authorization: Bearer {token}" in Swagger UI
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error
 */



const express = require('express');
const { body } = require("express-validator");
const asyncHandler = require("express-async-handler");
const {authenticate} = require('../utils/utils');
const { loginController, checkTokenAuthenticity } = require('../controllers/loginController')

const loginRouter = express.Router();
loginRouter.post(
    "/",
    [
        body("email").isEmail(),
        body("password").isString(),
    ],
    asyncHandler(loginController)
);

loginRouter.get("/check-token",authenticate, checkTokenAuthenticity);


module.exports =loginRouter;