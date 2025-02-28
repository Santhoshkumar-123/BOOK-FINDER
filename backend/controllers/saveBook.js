import axios from "axios";
import { Book } from "../models/Book.js";

/**
 * Save a book to the user's collection.
 */
export const saveBook = async (req, res) => {
  try {
    const { openLibraryId } = req.body;

    // Validate inputs
    if (!openLibraryId) {
      return res.status(400).json({
        success: false,
        message: "Open Library ID is required",
      });
    }


    // Check for existing book first
    const existingBook = await Book.findOne({
      openLibraryId,
      addedBy: req.user.id,
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "Book already exists in your collection",
        data: existingBook,
      });
    }

    // Fetch book data with error handling
    let bookData;
    try {
      const apiUrl = `https://openlibrary.org/works/${openLibraryId}.json`;
      const response = await axios.get(apiUrl);
      bookData = response.data;
    } catch (error) {
      console.error("Open Library API error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch book data from Open Library",
        error: error.message,
      });
    }

    // Process authors with error handling
    let authors = [];
    if (bookData.authors && Array.isArray(bookData.authors)) {
      try {
        authors = await Promise.all(
          bookData.authors.map(async (authorObj) => {
            if (!authorObj.author || !authorObj.author.key)
              return "Unknown Author"; // Ensure proper structure
            try {
              const authorResponse = await axios.get(
                `https://openlibrary.org${authorObj.author.key}.json`
              );
              const authorData = authorResponse.data;
              return (
                authorData.personal_name || authorData.name || "Unknown Author"
              ); // Prefer `personal_name`
            } catch (error) {
              console.error("Author fetch error:", error);
              return "Unknown Author";
            }
          })
        );
      } catch (error) {
        console.error("Authors processing error:", error);
      }
    }

    const newBook = new Book({
      title: bookData.title || bookData.work_title || "Untitled",
      authors: authors.length > 0 ? authors : ["Unknown Author"], // Ensure array
      publishYear:
        bookData.first_publish_date ||
        bookData.publish_date ||
        (bookData.created ? bookData.created.value?.substring(0, 4) : "Unknown"),
      openLibraryId,
      isbn: bookData.isbn_10 || bookData.isbn_13 || [], // Extract both ISBN-10 and ISBN-13
      coverUrl:
        bookData.covers && bookData.covers.length > 0
          ? `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg`
          : null,
      description: bookData.description
        ? typeof bookData.description === "object"
          ? bookData.description.value
          : bookData.description
        : "No description available",
      subjects: Array.isArray(bookData.subjects) ? bookData.subjects : [],
      addedBy: req.user.id,
    });

    await newBook.save();

    // Save with error handling
    try {
      await newBook.save();
      return res.status(201).json({
        success: true,
        message: "Book saved successfully",
        data: newBook,
      });
    } catch (saveError) {
      console.error("Database save error:", saveError);
      return res.status(500).json({
        success: false,
        message: "Failed to save book to database",
        error: saveError.message,
      });
    }
  } catch (error) {
    console.error("Error in saveBook controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save book",
      error: error.message,
    });
  }
};

/**
 * Fetch all saved books for a user.
 */
export const getSavedBooks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const userId = req.user.id;
    const books = await Book.find({ addedBy: userId });

    return res.status(200).json({
      success: true,
      message: "Saved books retrieved successfully",
      data: books,
    });
  } catch (error) {
    console.error("Error fetching saved books:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved books",
      error: error.message,
    });
  }
};

/**
 * Delete a saved book by ID.
 */
export const deleteSavedBook = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const book = await Book.findOneAndDelete({ _id: id, addedBy: userId });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found or does not belong to you",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
};
