const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', // Specify the version of OpenAPI
    info: {
      title: 'chrome extension backend API Documentation',
      version: '1.0.0',
      description: 'Documentation for API',
    },
  },
  // Define the paths to your API routes
  apis: ['./routes/*.js'], // Replace with the actual path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
