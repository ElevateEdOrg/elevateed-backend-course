const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth API",
      version: "1.0.0",
      description: "Login and Token Verification APIs",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional but recommended
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Adjust the path to your route files
};


const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};