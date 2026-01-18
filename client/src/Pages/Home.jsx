import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PostCard from '../Components/PostCard'
import { fetchFeedPosts, clearError } from '../redux/Posts/postsSlice'

function Home() {
  const dispatch = useDispatch()
  const { feedPosts, isLoading, error } = useSelector((state) => state.posts)

  useEffect(() => {
    dispatch(fetchFeedPosts())
  }, [dispatch])

  const handleRetry = () => {
    dispatch(clearError())
    dispatch(fetchFeedPosts())
  }

  if (isLoading) {
    return (
      <div className='max-w-2xl mx-auto mt-6 px-4'>
        <div className='text-center py-8'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4'></div>
          <p className='text-white/60'>Loading your feed...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='max-w-2xl mx-auto mt-6 px-4'>
        <div className='text-center py-8'>
          <p className='text-red-400 mb-4'>{error}</p>
          <button
            onClick={handleRetry}
            className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (feedPosts.length === 0) {
    return (
      <div className='max-w-2xl mx-auto mt-6 px-4'>
        <div className='text-center py-8'>
          <p className='text-white/60 mb-4'>No posts to show yet.</p>
          <p className='text-white/40 text-sm'>Follow some users to see their posts in your feed!</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-2xl mx-auto mt-6'>
      {feedPosts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  )
}

export default Home
