// Swagger Auto-gen Setup

const swaggerAutogen = require('swagger-autogen')();

const outputFile = './services/swagger/swagger-output.json';
const endpointsFiles = ['./server.js'];

const swaggerOptions = {
    info: {
        title: 'Grocernest e-com API',
        description: 'Grocernest e-com backend services documentation',
    },
    host: 'localhost:4000',
    schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, swaggerOptions)