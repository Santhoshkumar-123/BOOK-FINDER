import express from 'express';
import { saveBook, getSavedBooks, deleteSavedBook } from '../controllers/saveBook.js';

const router = express.Router();

// All routes here are already protected by checkAuth in server.js
router.get('/', getSavedBooks);
router.post('/save', saveBook);  // Add the save route here
router.delete('/:id', deleteSavedBook);

export default router;