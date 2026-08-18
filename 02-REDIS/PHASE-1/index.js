// import express from "express";
// import dotenv from "dotenv";
// import Redis from "ioredis";

// import { MongoDbconnect } from "./config/db.js";
// import User from "./Models/user.model.js";

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(express.json());

// // ==============================
// // Redis
// // ==============================

// const redis = new Redis(process.env.REDIS_URL);

// redis.on("connect", () => {
//     console.log("Redis connected successfully");
// });

// redis.on("error", (error) => {
//     console.error("Redis Error:", error.message);
// });

// // ==============================
// // Home
// // ==============================

// app.get("/", (req, res) => {
//     res.status(200).send("Server is running!");
// });

// // ==============================
// // Create User
// // ==============================

// app.post("/create", async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 message: "Name, email and password are required"
//             });
//         }

//         const user = await User.create({
//             name,
//             email,
//             password
//         });

//         // Old Redis cache delete
//         await redis.del("user:all");

//         res.status(201).json({
//             message: "User created successfully",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email
//             }
//         });

//     } catch (error) {
//         console.error("Create user error:", error);

//         res.status(500).json({
//             message: "Failed to create user"
//         });
//     }
// });

// // ==============================
// // Normal GET
// // MongoDB only
// // ==============================

// app.get("/users", async (req, res) => {
//     try {
//         const users = await User.find().select("-password");

//         res.status(200).json({
//             message: "Users fetched successfully",
//             users
//         });

//     } catch (error) {
//         console.error("Get users error:", error);

//         res.status(500).json({
//             message: "Failed to fetch users"
//         });
//     }
// });

// // ==============================
// // GET WITH REDIS
// // ==============================

// app.get("/get-with-redis", async (req, res) => {
//     try {
//         // Check Redis
//         const cached = await redis.get("user:all");

//         if (cached) {
//             console.log("⚡ Data fetched from Redis");

//             return res.status(200).json({
//                 message: "Users fetched from Redis",
//                 source: "redis",
//                 users: JSON.parse(cached)
//             });
//         }


// //otp store in redis with eprire tym 
// app.post("/send-otp", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     await redis.set(`otp:${email}`, otp, {
//       EX: 30,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "OTP generated successfully",
//       otp: otp,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// }); 
//         // Redis me data nahi mila
//         console.log("🐌 Redis cache miss -> MongoDB");

//         const users = await User.find()
//             .select("-password")
//             .lean();

//         // MongoDB data Redis me save
//         await redis.set(
//             "user:all",
//             JSON.stringify(users)
//         );

//         console.log("✅ Data saved in Redis");

//         return res.status(200).json({
//             message: "Users fetched from MongoDB",
//             source: "mongodb",
//             users
//         });

//     } catch (error) {
//         console.error("Redis route error:", error);

//         res.status(500).json({
//             message: "Failed to fetch users"
//         });
//     }
// });

// // ==============================
// // Start Server
// // ==============================

// const startServer = async () => {
//     try {
//         await MongoDbconnect();

//         app.listen(port, () => {
//             console.log(`Server running on port ${port}`);
//         });

//     } catch (error) {
//         console.error(
//             "Failed to start server:",
//             error.message
//         );

//         process.exit(1);
//     }
// };

// startServer();



//  OTP store + expiry automatically.

// import express from "express";
// import dotenv from "dotenv";
// import Redis from "ioredis";

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 8000;

// // ==============================
// // Middleware
// // ==============================

// app.use(express.json());

// // ==============================
// // Redis
// // ==============================

// const redis = new Redis(process.env.REDIS_URL);

// redis.on("connect", () => {
//     console.log("Redis connected successfully");
// });

// redis.on("error", (error) => {
//     console.error("Redis Error:", error.message);
// });

// // ==============================
// // Rate Limiter
// // ==============================

// const rateLimiter = async (req, res, next) => {
//     try {
//         const ip = req.ip;

//         const key = `rate_limit:${ip}`;

//         const requests = await redis.incr(key);

//         // First request → start 60 second timer
//         if (requests === 1) {
//             await redis.expire(key, 60);
//         }

//         // Maximum 5 requests per minute
//         if (requests > 5) {
//             return res.status(429).json({
//                 success: false,
//                 message: "Too Many Requests"
//             });
//         }

//         next();

//     } catch (error) {
//         console.error("Rate limiter error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Rate limiter error"
//         });
//     }
// };

// // ==============================
// // Home
// // ==============================

// app.get("/", (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "OTP Server is running!"
//     });
// });

// // ==============================
// // SEND OTP
// // ==============================

// app.post("/send-otp", rateLimiter, async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email is required"
//             });
//         }

//         // Generate 6 digit OTP
//         const otp = Math.floor(
//             100000 + Math.random() * 900000
//         ).toString();

//         // Store OTP for 30 seconds
//         await redis.set(
//             `otp:${email}`,
//             otp,
//             "EX",
//             30
//         );

//         console.log(`OTP for ${email}: ${otp}`);

//         return res.status(200).json({
//             success: true,
//             message: "OTP generated successfully",
//             otp // Testing only
//         });

//     } catch (error) {
//         console.error("Send OTP error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// });

// // ==============================
// // VERIFY OTP
// // ==============================

// app.post("/verify-otp", rateLimiter, async (req, res) => {
//     try {
//         const { email, otp } = req.body;

//         if (!email || !otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email and OTP are required"
//             });
//         }

//         // Get OTP from Redis
//         const savedOtp = await redis.get(`otp:${email}`);

//         if (!savedOtp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "OTP expired or not found"
//             });
//         }

//         // Check OTP
//         if (savedOtp !== otp.toString()) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid OTP"
//             });
//         }

//         // Delete OTP after successful verification
//         await redis.del(`otp:${email}`);

//         return res.status(200).json({
//             success: true,
//             message: "OTP verified successfully"
//         });

//     } catch (error) {
//         console.error("Verify OTP error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// });

// // ==============================
// // START SERVER
// // ==============================

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });




// for queuee 

// without queue

// import express from "express";
// import dotenv from "dotenv";
// import Redis from "ioredis";

// import { MongoDbconnect } from "./config/db.js";
// import User from "./Models/user.model.js";
// import sendemail from "../config/sendeamil.js";

// dotenv.config();
// export const redis = new Redis();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(express.json());


// // ==============================
// // HOME
// // ==============================

// app.get("/", (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Server is running!"
//     });
// });


// // ==============================
// // CREATE USER
// // ==============================

// app.post("/create-user", async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Validation
//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Name, email and password are required"
//             });
//         }

//         // Create user in MongoDB
//         const user = await User.create({
//             name,
//             email,
//             password
//         });

//         // Delete old users cache
//         await redis.del("users:all");

//         return res.status(201).json({
//             success: true,
//             message: "User created successfully",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email
//             }
//         });
//         sendemail()

//     } catch (error) {
//         console.error("Create user error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to create user"
//         });
//     }
// });


// // ==============================
// // GET USERS
// // ==============================

// app.get("/users", async (req, res) => {
//     try {
//         const users = await User
//             .find()
//             .select("-password");

//         return res.status(200).json({
//             success: true,
//             message: "Users fetched successfully",
//             users
//         });

//     } catch (error) {
//         console.error("Get users error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch users"
//         });
//     }
// });


// // ==============================
// // START SERVER
// // ==============================

// const startServer = async () => {
//     try {
//         await MongoDbconnect();

//         app.listen(port, () => {
//             console.log(`Server running on port ${port}`);
//         });

//     } catch (error) {
//         console.error(
//             "Failed to start server:",
//             error.message
//         );

//         process.exit(1);
//     }
// };

// startServer();




// ############# WITH QUEUE  ####################


import express from "express";
import dotenv from "dotenv";
import Redis from "ioredis";

import { MongoDbconnect } from "./config/db.js";
import User from "./Models/user.model.js";
import { emailQueue } from "./queue.js";

dotenv.config();

export const redis = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
);

const app = express();
const port = process.env.PORT || 5000;

// ==============================
// MIDDLEWARE
// ==============================

app.use(express.json());

// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running!",
    });
});

// ==============================
// CREATE USER
// ==============================

app.post("/create-user", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        // Create user in MongoDB
        const user = await User.create({
            name,
            email,
            password,
        });

        // Delete old users cache
        await redis.del("users:all");

        // Add email job to BullMQ
        await emailQueue.add("send-welcome-email", {
            email: user.email,
            name: user.name,
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Create user error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create user",
        });
    }
});

// ==============================
// GET USERS
// ==============================

app.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users,
        });
    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
});

// ==============================
// START SERVER
// ==============================

const startServer = async () => {
    try {
        // MongoDB connection
        await MongoDbconnect();

        // Redis connection
        await redis.ping();
        console.log("Redis connected successfully");

        // Start server
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