import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BsBook, BsBookmarkFill, BsBoxArrowRight } from 'react-icons/bs'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const isActive = path => {
    return location.pathname === path ? 'bg-blue-700' : ''
  }

  return (
    <nav className='bg-blue-800 text-white px-4 py-3 shadow-md'>
      <div className='max-w-6xl mx-auto flex justify-between items-center'>
        <Link
          to='/home'
          className='text-xl font-bold flex items-center hover:text-blue-200 transition-colors'
        >
          <BsBook className='mr-2 text-2xl' />
          BookFinder
        </Link>

        <div className='flex items-center space-x-4'>
          <Link
            to='/saved-books'
            className={`flex items-center hover:text-blue-200 transition-colors px-3 py-2 rounded-md ${isActive(
              '/books'
            )}`}
          >
            <BsBookmarkFill className='mr-2' />
            My Books
          </Link>

          <button
            onClick={handleLogout}
            className='flex items-center hover:text-blue-200 transition-colors px-3 py-2 rounded-md hover:bg-blue-700'
          >
            <BsBoxArrowRight className='mr-2' />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
