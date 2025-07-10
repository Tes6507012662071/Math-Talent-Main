// import app from "./app";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import registrationRoutes from "./routes/registration";
// import express from "express";

// dotenv.config();

// app.use("/uploads", express.static("uploads"));
// app.use("/api/registration", registrationRoutes);

// mongoose.connect(process.env.MONGO_URI!)
//   .then(() => {
//     app.listen(process.env.PORT, () =>
//       console.log(`🚀 Server running at http://localhost:${process.env.PORT}`)
//     );
//   })
//   .catch((err) => console.error("MongoDB connection failed:", err));


// backend/server.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app";

// โหลด ENV config
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/math-talent";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
