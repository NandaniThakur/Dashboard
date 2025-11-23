// const express = require('express');
// const app = express();

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// const PORT = process.env.PORT || 3005;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth/routes.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import dashboardRoleRoutes from "./routes/auth/DashboardRoleRoutes.js";


dotenv.config();
const app = express();      

// console.log("MONGO from env:", process.env.MONGODB_URL);
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Adjust the origin as needed

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Routes
app.use("/api/auth", authRoutes);  
app.use("/api/dashboard", dashboardRoleRoutes);     

//something runnng o th serer
    //   app.get("/", (req, res) => {
    //         res.send("Backend Server Running 🚀");
    //         });

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 3005;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

  
        
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Rejection:', err);
            server.close(() => process.exit(1));
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};



startServer(); 



// import cors from "cors";
// app.use(cors({
//   origin: "http://localhost:3005",
//   credentials: true,
// }));

// export default app;