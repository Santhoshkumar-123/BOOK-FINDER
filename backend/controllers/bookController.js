import axios from "axios";

/**
 * Search books from Open Library API
 */
export const searchBooks = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Open Library does not support `limit` directly, so we paginate manually
    const start = (page - 1) * limit;
    const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      query
    )}&page=${page}`;

    const response = await axios.get(apiUrl);
    const { docs, numFound } = response.data;

    // Transform the response data
    const books = docs.slice(0, limit).map((book) => ({
      title: book.title,
      authors: book.author_name || [],
      publishYear: book.first_publish_year || "Unknown",
      isbn: book.isbn ? book.isbn[0] : null,
      coverId: book.cover_i,
      coverUrl: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
      subjects: book.subject || [],
      key: book.key,
      openLibraryId: book.key?.split("/").pop(),
    }));

    return res.json({
      success: true,
      data: {
        books,
        pagination: {
          total: numFound,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(numFound / limit),
        },
      },
    });
  } catch (error) {
    console.error("Book search error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to search books",
      error: error.message,
    });
  }
};

/**
 * Get book details from Open Library API
 */
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required",
      });
    }

    // Fetch book details
    const apiUrl = `https://openlibrary.org/works/${id}.json`;
    const response = await axios.get(apiUrl);
    const bookData = response.data;

    // Extract authors (if available)
    let authors = [];
    if (bookData.authors) {
      const authorPromises = bookData.authors
        .map((author) => author.author?.key)
        .filter(Boolean)
        .map(async (authorKey) => {
          try {
            const res = await axios.get(`https://openlibrary.org${authorKey}.json`);
            return { name: res.data.name, key: res.data.key };
          } catch {
            return null;
          }
        });

      authors = (await Promise.all(authorPromises)).filter(Boolean);
    }

    const bookDetails = {
      key: bookData.key,
      openLibraryId: id,
      title: bookData.title,
      description:
        typeof bookData.description === "object"
          ? bookData.description.value
          : bookData.description || "No description available",
      subjects: bookData.subjects || [],
      covers:
        bookData.covers?.map(
          (coverId) => `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        ) || [],
      authors,
      excerpts: bookData.excerpts?.map((excerpt) => excerpt.text) || [],
      links:
        bookData.links?.map((link) => ({
          url: link.url,
          title: link.title,
        })) || [],
    };

    return res.json({
      success: true,
      data: bookDetails,
    });
  } catch (error) {
    console.error("Get book details error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get book details",
      error: error.message,
    });
  }
};
