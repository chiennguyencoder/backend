import swaggerJSDoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "test swagger",
      version: "1.0.0",
      description: "test swagger",
    },
  },
  apis: ["./src/route.ts"], 
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
