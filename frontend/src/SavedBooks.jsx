import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BsTrash, BsInfoCircle } from 'react-icons/bs'
import Spinner from './components/Spinner'

const SavedBooks = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }
    fetchSavedBooks()
  }, [])

  const fetchSavedBooks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5555/api/books/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBooks(response.data.data)
    } catch (error) {
      console.error('Error fetching saved books:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/')
      } else {
        setError('Failed to load your saved books')
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteBook = async id => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5555/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBooks(prevBooks => prevBooks.filter(book => book._id !== id))
    } catch (error) {
      console.error('Error deleting book:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/')
      } else {
        setError('Failed to delete book')
      }
    }
  }

  if (loading) return <Spinner />
  if (error) return <div className='text-red-500 text-center mt-4'>{error}</div>

  return (
    <div className='max-w-6xl mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>My Saved Books</h1>

      {books.length === 0 ? (
        <div className='text-center text-gray-500 mt-8'>
          <p>No books saved yet.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {books.map(book => (
            <div key={book._id} className='border rounded-lg shadow-md p-4'>
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className='w-full h-48 object-contain mb-4'
                />
              ) : (
                <div className='w-full h-48 bg-gray-200 flex items-center justify-center mb-4'>
                  No Cover Available
                </div>
              )}

              <h2 className='text-xl font-semibold mb-2'>{book.title}</h2>
              <p className='text-gray-600 mb-2'>
                {book.authors?.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
              </p>
              <p className='text-gray-500 text-sm mb-2'>
                Published: {book.publishYear || 'Unknown'}
              </p>

              {book.isbn?.length > 0 && (
                <p className='text-gray-400 text-sm mb-4'>ISBN: {book.isbn.join(', ')}</p>
              )}

              <div className='flex justify-between items-center'>
                <Link
                  to={`/books/details/${book.openLibraryId}`}
                  className='flex items-center text-blue-600 hover:text-blue-800 transition-colors'
                >
                  <BsInfoCircle className='mr-1' />
                  Details
                </Link>

                <button
                  onClick={() => deleteBook(book._id)}
                  className='flex items-center text-red-600 hover:text-red-800 transition-colors'
                >
                  <BsTrash className='mr-1' />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedBooks
