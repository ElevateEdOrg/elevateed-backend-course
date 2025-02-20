require("dotenv").config();
const jwt = require("jsonwebtoken");
function isAuth(req, res, next) {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid token" });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: "no token passed in headers" });
  }
}

function isInstructor(req, res, next) {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid token" });
      } else {
        req.user = decode;
        if(user.role=='instructor'){
          next();
        }else{
          res.status(403).send({ message: "You are not an instructor" });
        }
      }
    });
  } else {
    res.status(401).send({ message: "no token passed in headers" });
  }
}

module.exports = isAuth;
