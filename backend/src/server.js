import express from "express";
import { swaggerUi, swaggerSpec } from "./swagger.js";
import app from "./src/app.js";
const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
