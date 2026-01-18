import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  loginUser,
  verifyOTP,
  clearError,
  setEmail
} from '../redux/Auth/authSlice'

function Login () {
  const [email, setEmailInput] = useState('')
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

  const handleSendOTP = async e => {
    e.preventDefault()
    if (!email.trim()) return

    const result = await dispatch(loginUser(email.trim()))
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(setEmail(email.trim()))
    }
  }

  const handleVerifyOTP = async e => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return

    const result = await dispatch(
      verifyOTP({ email: reduxEmail || email, otp })
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
          Welcome back
        </h1>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}

        {/* Email Input */}
        {!otpSent && (
          <form onSubmit={handleSendOTP} className='mb-6'>
            <input
              type='email'
              placeholder='Email address'
              value={email}
              onChange={e => setEmailInput(e.target.value)}
              disabled={isLoading}
              className='
                w-full bg-transparent
                text-white placeholder:text-gray-500
                border-b border-white/20
                focus:outline-none focus:border-white/40
                py-2 sm:py-3
                text-center
                disabled:opacity-50
              '
            />
            <button
              type='submit'
              disabled={!email.trim() || isLoading}
              className='
                w-full mt-6 py-3
                text-xs sm:text-sm tracking-wide
                text-white/90
                border-t border-b border-white/25
                hover:border-white/50
                hover:text-white
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              '
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* OTP Input */}
        {otpSent && (
          <form onSubmit={handleVerifyOTP}>
            <div
              className='
              flex justify-center
              gap-2 sm:gap-3
              mt-8 mb-8
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

            <button
              type='submit'
              disabled={!otp || otp.length !== 6 || isLoading}
              className='
                w-full py-3
                text-xs sm:text-sm tracking-wide
                text-white
                border-t border-b border-white/40
                hover:border-white
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              '
            >
              {isLoading ? 'Verifying...' : 'Login'}
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
              Use different email
            </button>
          </form>
        )}

        {/* Footer CTA */}
        <div className='mt-10 text-xs sm:text-sm text-gray-400'>
          No account?{' '}
          <Link to={'/signup'}>
            <span
              className='
              text-white
              cursor-pointer
              border-b border-white/40
              hover:border-white
              transition
            '
            >
              Sign up
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
