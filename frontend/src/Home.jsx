import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Spinner from './components/Spinner'
import { Link, useNavigate } from 'react-router-dom'
import { BsBookmarkPlus, BsInfoCircle, BsSearch } from 'react-icons/bs'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || 'User'

  // Setup axios with authentication token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    // Create axios interceptor to handle auth
    const interceptor = axios.interceptors.request.use(
      config => {
        config.headers.Authorization = `Bearer ${token}`
        return config
      },
      error => Promise.reject(error)
    )

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.request.eject(interceptor)
    }
  }, [navigate])

  const handleSearch = async e => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setErrorMessage('Please enter a search query')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const response = await axios.get(
        `http://localhost:5555/api/search?query=${encodeURIComponent(
          searchQuery
        )}`
      )
      setBooks(response.data.data.books)

      if (response.data.data.books.length === 0) {
        setErrorMessage('No books found. Try another search term.')
      }
    } catch (error) {
      console.error('Search error:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/')
      } else {
        setErrorMessage('An error occurred while searching. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const saveBook = async book => {
    try {
      if (!book.openLibraryId) {
        setErrorMessage('Invalid book data')
        return
      }

      const response = await axios.post(
        'http://localhost:5555/api/books/save',
        {
          openLibraryId: book.openLibraryId,
          isbn: book.isbn
        }
      )

      if (response.data.success) {
        alert(`Book "${book.title}" saved successfully!`)
      }
    } catch (error) {
      console.error('Error saving book:', error)
      if (error.response?.status === 409) {
        alert('This book is already saved in your collection.')
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/')
      } else {
        alert('Failed to save book. Please try again.')
      }
    }
  }

  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Hi, {name} 👋</h1>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className='mb-8'>
        <div className='flex items-center border-2 rounded-lg overflow-hidden shadow-sm'>
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search for books by title or author'
            className='flex-grow p-3 outline-none'
            aria-label='Search for books'
          />
          <button
            type='submit'
            className='bg-blue-600 text-white p-3 flex items-center hover:bg-blue-700 transition-colors'
            aria-label='Search books'
          >
            <BsSearch className='mr-2' />
            Search
          </button>
        </div>
        {errorMessage && <p className='text-red-500 mt-2'>{errorMessage}</p>}
      </form>

      {/* Loading Spinner */}
      {loading && (
        <div className='flex justify-center my-10'>
          <Spinner />
        </div>
      )}

      {/* Results Section */}
      {!loading && books.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {books.map(book => (
            <div
              key={book.key}
              className='border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow p-4'
            >
              {/* Book Cover */}
              <div className='flex justify-center mb-4'>
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    className='h-48 object-contain'
                  />
                ) : (
                  <div className='w-32 h-48 bg-gray-200 flex items-center justify-center text-gray-500'>
                    No Cover
                  </div>
                )}
              </div>

              {/* Book Info */}
              <h2 className='text-xl font-semibold mb-2 line-clamp-2'>
                {book.title}
              </h2>
              <p className='text-gray-700 mb-2'>
                {book.authors?.length
                  ? book.authors.join(', ')
                  : 'Unknown Author'}
              </p>
              <p className='text-gray-600 text-sm mb-4'>
                {book.publishYear
                  ? `Published: ${book.publishYear}`
                  : 'Publication year unknown'}
              </p>

              {/* Actions */}
              <div className='flex justify-between mt-4'>
                <Link
                  to={`/books/details/${book.openLibraryId}`}
                  className='flex items-center text-blue-600 hover:text-blue-800 transition-colors'
                  aria-label={`View details of ${book.title}`}
                >
                  <BsInfoCircle className='mr-1' />
                  Details
                </Link>

                <button
                  onClick={() => saveBook(book)}
                  className='flex items-center text-green-600 hover:text-green-800 transition-colors'
                  aria-label={`Save ${book.title}`}
                >
                  <BsBookmarkPlus className='mr-1' />
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && books.length === 0 && searchQuery.length > 0 && (
        <div className='text-center my-16 text-gray-500'>
          <p>
            No books found matching "
            <span className='font-semibold'>{searchQuery}</span>".
          </p>
          <p className='mt-2'>
            Try adjusting your search terms or searching for a different book.
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
