import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

// Load environment variables
dotenv.config();

// Initialize database (creates tables if not exist)
import "./database/database";
import { seedDefaultAdmin } from "./database/seed";
import { swaggerSpec } from "./swagger";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import fileRoutes from "./routes/file.routes";


const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/files", fileRoutes);


// Health check
app.get("/", (_req, res) => {
    res.json({
        message: "SPS Server API is running",
        docs: "/api-docs",
    });
});

// Seed default admin user
seedDefaultAdmin();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});
