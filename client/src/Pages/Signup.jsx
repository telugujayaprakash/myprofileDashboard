import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  registerUser,
  verifyOTP,
  clearError,
  setEmail
} from '../redux/Auth/authSlice'

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phonenumber: ''
  })
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    isLoading,
    error,
    otpSent,
    email: reduxEmail,
    isAuthenticated
  } = useSelector(state => state.auth)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/feed')
    }
  }, [isAuthenticated, navigate])

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'username' ? value.toLowerCase() : value
    })
  }

  const handleSendOTP = async e => {
    e.preventDefault()
    if (!formData.username.trim() || !formData.email.trim()) return

    const result = await dispatch(registerUser(formData))
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(setEmail(formData.email.trim()))
    }
  }

  const handleVerifyOTP = async e => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return

    const result = await dispatch(
      verifyOTP({ email: reduxEmail || formData.email, otp })
    )
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/feed')
    }
  }

  const handleOtpChange = value => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '')
    setOtp(numericValue)
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#0B0D0F] px-4'>
      <div className='w-full max-w-md text-center'>
        {/* Heading */}
        <h1
          className='
          text-xl sm:text-2xl
          font-light text-white
          mb-8 sm:mb-10
        '
        >
          Create your account
        </h1>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}

        {/* Registration Form */}
        {!otpSent && (
          <form onSubmit={handleSendOTP}>
            {/* Username */}
            <div className='mb-5 sm:mb-6'>
              <input
                type='text'
                name='username'
                placeholder='Username'
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                className='
                  w-full bg-transparent
                  text-white placeholder:text-gray-500
                  border-b border-white/20
                  focus:outline-none focus:border-white/40
                  py-2 sm:py-3
                  text-center text-sm sm:text-base
                  disabled:opacity-50
                '
              />
            </div>
            {/* Email */}
            <div className='mb-5 sm:mb-6'>
              <input
                type='email'
                name='email'
                placeholder='Email address'
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className='
                  w-full bg-transparent
                  text-white placeholder:text-gray-500
                  border-b border-white/20
                  focus:outline-none focus:border-white/40
                  py-2 sm:py-3
                  text-center text-sm sm:text-base
                  disabled:opacity-50
                '
              />
            </div>
            {/* Phone Number (Optional) */}
            <div className='mb-5 sm:mb-6'>
              <input
                type='tel'
                name='phonenumber'
                placeholder='Phone number (optional)'
                value={formData.phonenumber}
                onChange={handleInputChange}
                disabled={isLoading}
                className='
                  w-full bg-transparent
                  text-white placeholder:text-gray-500
                  border-b border-white/20
                  focus:outline-none focus:border-white/40
                  py-2 sm:py-3
                  text-center text-sm sm:text-base
                  disabled:opacity-50
                '
              />
            </div>
            {/* Send OTP Button */}
            <button
              type='submit'
              disabled={
                !formData.username.trim() || !formData.email.trim() || isLoading
              }
              className='
                w-full mt-3 sm:mt-4
                py-2.5 sm:py-3
                text-xs sm:text-sm
                tracking-wide
                text-white/80
                hover:text-white
                transition
                disabled:opacity-50 disabled:cursor-not-allowed
              '
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* OTP Verification */}
        {otpSent && (
          <form onSubmit={handleVerifyOTP}>
            <div
              className='
              flex justify-center
              gap-2 sm:gap-3
              mt-6 sm:mt-8
              mb-6 sm:mb-8
            '
            >
              <input
                type='text'
                maxLength='6'
                value={otp}
                onChange={e => handleOtpChange(e.target.value)}
                placeholder='Enter 6-digit OTP'
                className='
                  w-full text-center
                  bg-transparent
                  text-white placeholder:text-gray-500
                  border-b border-white/30
                  focus:outline-none focus:border-white
                  py-2 sm:py-3
                  text-lg
                '
              />
            </div>

            {/* Create Account Button */}
            <button
              type='submit'
              disabled={!otp || otp.length !== 6 || isLoading}
              className='
                w-full
                py-2.5 sm:py-3
                text-xs sm:text-sm
                tracking-wide
                text-white
                border border-white/20
                hover:border-white/40
                transition
                disabled:opacity-50 disabled:cursor-not-allowed
              '
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>

            <button
              type='button'
              onClick={() => {
                dispatch(setEmail(''))
                setOtp('')
              }}
              className='
                w-full mt-4 py-2
                text-xs text-gray-400
                hover:text-white
                transition
              '
            >
              Use different details
            </button>
          </form>
        )}

        {/* Footer CTA */}
        <div className='mt-10 text-xs sm:text-sm text-gray-400'>
          Have account?{' '}
          <Link to={'/'}>
            <span
              className='
              text-white
              cursor-pointer
              border-b border-white/40
              hover:border-white
              transition
            '
            >
              Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
