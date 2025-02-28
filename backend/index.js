import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import booksRoute from "./routes/booksRoute.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import { searchBooks, getBookById } from "./controllers/bookController.js";
import { saveBook } from "./controllers/saveBook.js";
import checkAuth from "./middleware/checkAuth.js";

const app = express();

// Middleware for all routes
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || "*"); // Allows any origin
    },
    credentials: true,
  })
);

// Create API router for better organization
const apiRouter = express.Router();

// Public routes
app.get("/", (request, response) => {
  return response.status(200).send("Welcome To Book API");
});

// Auth routes (public)
app.use("/api/auth", authRoutes);

// Protected API routes
apiRouter.use("/books", booksRoute);
apiRouter.get("/search", searchBooks);
apiRouter.get("/books/:id", getBookById);

// Apply authentication middleware to all API routes
app.use("/api", checkAuth, apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred",
    error: err.message,
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });
