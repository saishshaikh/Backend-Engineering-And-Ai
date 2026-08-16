import express from "express";
import dotenv from "dotenv";
import Redis from "ioredis";

import { MongoDbconnect } from "./config/db.js";
import User from "./Models/user.model.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// ==============================
// Redis
// ==============================

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
    console.log("Redis connected successfully");
});

redis.on("error", (error) => {
    console.error("Redis Error:", error.message);
});

// ==============================
// Home
// ==============================

app.get("/", (req, res) => {
    res.status(200).send("Server is running!");
});

// ==============================
// Create User
// ==============================

app.post("/create", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        // Old Redis cache delete
        await redis.del("user:all");

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            message: "Failed to create user"
        });
    }
});

// ==============================
// Normal GET
// MongoDB only
// ==============================

app.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json({
            message: "Users fetched successfully",
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});

// ==============================
// GET WITH REDIS
// ==============================

app.get("/get-with-redis", async (req, res) => {
    try {
        // Check Redis
        const cached = await redis.get("user:all");

        if (cached) {
            console.log("⚡ Data fetched from Redis");

            return res.status(200).json({
                message: "Users fetched from Redis",
                source: "redis",
                users: JSON.parse(cached)
            });
        }

        // Redis me data nahi mila
        console.log("🐌 Redis cache miss -> MongoDB");

        const users = await User.find()
            .select("-password")
            .lean();

        // MongoDB data Redis me save
        await redis.set(
            "user:all",
            JSON.stringify(users)
        );

        console.log("✅ Data saved in Redis");

        return res.status(200).json({
            message: "Users fetched from MongoDB",
            source: "mongodb",
            users
        });

    } catch (error) {
        console.error("Redis route error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});

// ==============================
// Start Server
// ==============================

const startServer = async () => {
    try {
        await MongoDbconnect();

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.error(
            "Failed to start server:",
            error.message
        );

        process.exit(1);
    }
};

startServer();