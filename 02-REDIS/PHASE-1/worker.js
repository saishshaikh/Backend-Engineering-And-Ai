// worker.js

import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log(`Processing job: ${job.name}`);
    console.log("Job data:", job.data);

    const { to, subject, message } = job.data;

    // Email sending logic
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // Agar yahan error throw hota hai,
    // BullMQ job ko failed mark karega
    return {
      success: true,
      message: "Email processed successfully",
    };
  },
  {
    connection,
    concurrency: 5,
  }
);

// Job completed
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

// Job failed
worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

// Worker error
worker.on("error", (err) => {
  console.error("Worker error:", err);
});

console.log("Email worker is running...");