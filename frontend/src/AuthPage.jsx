import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom' // Import navigation hook

export default function AuthPage () {
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate() // Initialize navigation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const onSubmit = async data => {
    const url = isRegister ? '/register' : '/login'
    try {
      const response = await fetch(`http://localhost:5555/api/auth${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        // Store token in localStorage for authentication
        localStorage.setItem('token', result.token)
        localStorage.setItem('userId', result.userId)
        localStorage.setItem('name', result.name) // Store the user's name

        // Reset form and redirect to home page
        reset()
        navigate('/home') // Redirect to home page
      } else {
        alert(`Error: ${result.message || 'Authentication failed'}`)
      }
    } catch (error) {
      alert('Something went wrong. Try again.')
      console.error(error)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white shadow-md rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-2xl font-semibold text-center mb-4'>
          {isRegister ? 'Create an Account' : 'Login to Your Account'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {isRegister && (
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Name
              </label>
              <input
                {...register('name', { required: isRegister })}
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300'
                placeholder='Enter your name'
              />
              {errors.name && (
                <p className='text-red-500 text-sm'>Name is required</p>
              )}
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <input
              {...register('email', {
                required: true,
                pattern: /^\S+@\S+\.\S+$/
              })}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300'
              placeholder='Enter your email'
            />
            {errors.email && (
              <p className='text-red-500 text-sm'>Valid email is required</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <input
              type='password'
              {...register('password', { required: true, minLength: 6 })}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300'
              placeholder='Enter your password'
            />
            {errors.password && (
              <p className='text-red-500 text-sm'>
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type='submit'
            className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition'
          >
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className='text-center text-sm mt-4'>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className='text-blue-500 hover:underline'
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}
