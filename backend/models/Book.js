import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    authors: [
      {
        type: String,
      },
    ],
    publishYear: {
      type: String,
    },
    openLibraryId: {
      type: String,
      required: true,
    },
    isbn: {
      type: [String], // Store both ISBN-10 and ISBN-13 if available
    },
    coverUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    subjects: [
      {
        type: String,
      },
    ],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model("Book", bookSchema);
