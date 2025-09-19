import express from "express";
import userRoutes from "./route";
import { setupSwagger } from "./swagger";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(userRoutes);

setupSwagger(app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
