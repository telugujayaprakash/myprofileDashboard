import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import UserResult from '../Components/UserResult'
import PostCard from '../Components/PostCard'
import { searchUsers, searchPosts, setQuery, setActiveTab, clearResults, clearError } from '../redux/Search/searchSlice'

function Search() {
  const dispatch = useDispatch()
  const { query, activeTab, users, posts, isLoading, error } = useSelector((state) => state.search)
  const [localQuery, setLocalQuery] = useState('')
  const searchTimeoutRef = useRef(null)

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (localQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        dispatch(setQuery(localQuery.trim()))
        if (activeTab === 'users') {
          dispatch(searchUsers(localQuery.trim()))
        } else {
          dispatch(searchPosts(localQuery.trim()))
        }
      }, 500) // Wait 500ms after user stops typing
    } else {
      dispatch(clearResults())
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [localQuery, activeTab, dispatch])

  // Perform search when activeTab changes and query exists
  useEffect(() => {
    if (query.trim().length >= 2) {
      if (activeTab === 'users') {
        dispatch(searchUsers(query))
      } else {
        dispatch(searchPosts(query))
      }
    }
  }, [activeTab, query, dispatch])

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab))
    dispatch(clearError())
  }

  const handleRetry = () => {
    dispatch(clearError())
    if (query.trim().length >= 2) {
      if (activeTab === 'users') {
        dispatch(searchUsers(query))
      } else {
        dispatch(searchPosts(query))
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 mt-6">

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search users or posts (min 2 characters)"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="
          w-full bg-transparent
          text-white placeholder:text-gray-500
          border-b border-white/20
          focus:outline-none focus:border-white/40
          py-3 mb-6
        "
      />

      {/* Tabs */}
      <div className="flex gap-6 text-sm mb-6">
        {['users', 'posts'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`
              pb-1 transition
              ${activeTab === tab
                ? 'text-white border-b border-white'
                : 'text-white/60 hover:text-white'}
            `}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='text-center py-8'>
          <div className='inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2'></div>
          <p className='text-white/60 text-sm'>Searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className='text-center py-8'>
          <p className='text-red-400 mb-4'>{error}</p>
          <button
            onClick={handleRetry}
            className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm'
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <div>
          {/* Users Results */}
          {activeTab === 'users' && (
            <>
              {users.length === 0 && localQuery.trim().length >= 2 && (
                <div className='text-center py-8'>
                  <p className='text-white/60'>No users found for "{localQuery}"</p>
                </div>
              )}
              {users.map(user => (
                <UserResult key={user.userid} user={user} />
              ))}
            </>
          )}

          {/* Posts Results */}
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 && localQuery.trim().length >= 2 && (
                <div className='text-center py-8'>
                  <p className='text-white/60'>No posts found for "{localQuery}"</p>
                </div>
              )}
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </>
          )}

          {/* Empty State */}
          {localQuery.trim().length < 2 && (
            <div className='text-center py-8'>
              <p className='text-white/60'>Start typing to search...</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default Search
