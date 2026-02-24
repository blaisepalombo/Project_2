const swaggerAutogen = require("swagger-autogen")();

const isRender = !!process.env.RENDER_EXTERNAL_HOSTNAME;

const doc = {
  info: {
    title: "Energy Drink Log API",
    description:
      "CRUD API for logging energy drinks. Write routes require Google login via /auth/google.",
  },
  host: isRender
    ? process.env.RENDER_EXTERNAL_HOSTNAME
    : `localhost:${process.env.PORT || 3000}`,
  schemes: isRender ? ["https"] : ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger JSON generated:", outputFile);
});