const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Energy Drink Log API",
    description: "CRUD API for logging energy drinks",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger JSON generated:", outputFile);
});
