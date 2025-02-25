

require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");
const { db } = require('../dbconn');


function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );
}



const loginController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("from login malcious", errors.errors);
            return res
                .status(401)
                .json({ message: `${errors.errors[0].msg} ${errors.errors[0].path}` });
        }
        if (!req.body.email || !req.body.password) {
            res.status(401).json({ message: "empty request body " });
        } else {

            console.log("email ", req.body.email, req.body.password)
            const user = await db.User.findOne({ where: { email: req.body.email },attributes: { include: ["password"] }, });
            if (user) {
                if (req.body.password == user.password) {
                    res.status(200).json({
                        user: {
                            id: user.id,
                            name: user.full_name,
                            email: user.email,
                            role: user.role,
                        },
                        access: generateToken(user)
                    });
                } else {
                    res.status(401).json({ message: "wrong credentials" });
                }
            } else {
                res.status(401).json({ message: "wrong credentials" });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("server failed");
    }
}


const checkTokenAuthenticity = (req, res) => {
    res.status(200).json({ message: true });
}


module.exports = { loginController, checkTokenAuthenticity };
