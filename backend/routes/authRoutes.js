// routes/authRoutes.js - Create this new file
import express from 'express';
import { registerUser, loginUser } from '../controllers/loginController.js';

const router = express.Router();

// Authentication endpoints (public)
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;