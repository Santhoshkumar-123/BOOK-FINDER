import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Spinner from './components/Spinner'
import { BsBookmarkPlus, BsArrowLeft } from 'react-icons/bs'

const BookDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5555/api/books/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        setBook(response.data.data) // ✅ Fixing function call
        setLoading(false)
      } catch (error) {
        console.error('Error fetching saved books:', error)
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/')
        } else {
          setError('Failed to load book details')
        }
        setLoading(false)
      }
    }

    fetchBookDetails()
  }, [id, navigate])

  const saveBook = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      alert('You need to log in to save books.')
      navigate('/')
      return
    }

    try {
      await axios.post(
        'http://localhost:5555/api/books/save',
        {
          openLibraryId: id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert(`Book "${book.title}" saved successfully!`)
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert('This book is already saved in your collection.')
      } else {
        console.error('Error saving book:', error)
        alert('Failed to save book. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 max-w-4xl mx-auto text-center'>
        <p className='text-red-500 mb-4'>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!book) {
    return (
      <div className='p-4 max-w-4xl mx-auto text-center'>
        <p className='text-lg mb-4'>Book not found</p>
        <button
          onClick={() => navigate(-1)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <button
        onClick={() => navigate(-1)}
        className='flex items-center text-blue-600 hover:text-blue-800 mb-6'
      >
        <BsArrowLeft className='mr-2' />
        Back
      </button>

      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='md:flex'>
          {/* Book Cover */}
          <div className='md:w-1/3 p-6 flex justify-center bg-gray-50'>
            {book.covers && book.covers.length > 0 ? (
              <img
                src={book.covers[0]}
                alt={`Cover of ${book.title}`}
                className='max-h-96 object-contain'
              />
            ) : (
              <div className='w-48 h-64 bg-gray-200 flex items-center justify-center text-gray-500'>
                No Cover Available
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className='md:w-2/3 p-6'>
            <div className='flex justify-between items-start'>
              <h1 className='text-2xl font-bold mb-2'>{book.title}</h1>
              {/* <button
                onClick={saveBook}
                className='bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700'
              >
                <BsBookmarkPlus className='mr-2' />
                Save Book
              </button> */}
            </div>

            {/* Authors */}
            {book.authors && book.authors.length > 0 && (
              <div className='mb-4'>
                <h2 className='text-lg text-gray-700'>
                  By {book.authors.map(author => author.name).join(', ')}
                </h2>
                {book.firstPublishDate && (
                  <p className='text-gray-600'>
                    First published: {book.firstPublishDate}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {book.description && (
              <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Description</h3>
                <p className='text-gray-700 whitespace-pre-line'>
                  {typeof book.description === 'string'
                    ? book.description
                    : book.description.value || ''}
                </p>
              </div>
            )}

            {/* Subjects/Genres */}
            {book.subjects && book.subjects.length > 0 && (
              <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Subjects</h3>
                <div className='flex flex-wrap gap-2'>
                  {book.subjects.slice(0, 10).map((subject, index) => (
                    <span
                      key={index}
                      className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
                    >
                      {subject}
                    </span>
                  ))}
                  {book.subjects.length > 10 && (
                    <span className='text-gray-500 text-sm'>
                      +{book.subjects.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Excerpts */}
            {book.excerpts && book.excerpts.length > 0 && (
              <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Excerpt</h3>
                <div className='bg-gray-50 p-4 rounded-lg border border-gray-200 italic'>
                  {book.excerpts[0]}
                </div>
              </div>
            )}

            {/* Links */}
            {book.links && book.links.length > 0 && (
              <div>
                <h3 className='text-lg font-semibold mb-2'>External Links</h3>
                <ul className='list-disc pl-5'>
                  {book.links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline'
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetails
