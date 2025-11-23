// swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Role Based Auth API",
      version: "1.0.0",
      description: "Express API with JWT Authentication & Role Based Access",
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        }
      }
    },
    servers: [
      {
        url: "http://localhost:3005",
      },
    ],
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ["./routes/*.js"], // path to route files
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
