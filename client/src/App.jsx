import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { checkTokenAndHandleExpiration } from './utils/tokenHandler'
import { logout } from './redux/Auth/authSlice'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Profile from './Pages/Profile'
import Home from './Pages/Home'
import CreatePost from './Pages/Create-post'

import Navbar from './Components/Navbar'
import Search from './Pages/Search'

// Protected Route Component
function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    // Check token expiration on mount and when authentication state changes
    if (isAuthenticated) {
      const isValid = checkTokenAndHandleExpiration()
      if (!isValid) {
        dispatch(logout())
      }
    }
  }, [isAuthenticated, dispatch])

  // Check token before rendering
  if (isAuthenticated) {
    const isValid = checkTokenAndHandleExpiration()
    if (!isValid) {
      dispatch(logout())
      return <Navigate to='/' replace />
    }
  }

  return isAuthenticated ? children : <Navigate to='/' replace />
}

// Public Profile Route - Allows both authenticated and non-authenticated users
function PublicProfileRoute({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    // Check token expiration for authenticated users
    if (isAuthenticated) {
      const isValid = checkTokenAndHandleExpiration()
      if (!isValid) {
        dispatch(logout())
      }
    }
  }, [isAuthenticated, dispatch])

  // If authenticated, show with navbar
  if (isAuthenticated) {
    return (
      <div className='flex min-h-screen bg-[#0B0D0F]'>
        <Navbar />
        <main className='flex-1 md:ml-64 pt-14 md:pt-0'>
          {children}
        </main>
      </div>
    )
  }

  // If not authenticated, show without navbar (public view)
  return (
    <div className='min-h-screen bg-[#0B0D0F]'>
      {children}
    </div>
  )
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<Signup />} />

          {/* Protected App Routes */}
          <Route
            path='/feed'
            element={
              <ProtectedRoute>
                <div className='flex min-h-screen bg-[#0B0D0F]'>
                  <Navbar />
                  <main className='flex-1 md:ml-64 pt-14 md:pt-0'>
                    <Home />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path='/create'
            element={
              <ProtectedRoute>
                <div className='flex min-h-screen bg-[#0B0D0F]'>
                  <Navbar />
                  <main className='flex-1 md:ml-64 pt-14 md:pt-0'>
                    <CreatePost />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path='/:username'
            element={
              <PublicProfileRoute>
                <Profile />
              </PublicProfileRoute>
            }
          />

          <Route
            path='/search'
            element={
              <ProtectedRoute>
                <div className='flex min-h-screen bg-[#0B0D0F]'>
                  <Navbar />
                  <main className='flex-1 md:ml-64 pt-14 md:pt-0'>
                    <Search />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes to login */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
