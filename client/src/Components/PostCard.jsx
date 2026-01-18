import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatDate } from '../utils/formatDate'
import { likePost, sharePost } from '../redux/Posts/postsSlice'

function PostCard ({ post }) {
  const dispatch = useDispatch()
  const [isLiking, setIsLiking] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleLike = async () => {
    if (isLiking) return

    try {
      setIsLiking(true)
      await dispatch(likePost(post._id))
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    if (isSharing) return

    try {
      setIsSharing(true)
      const result = await dispatch(sharePost(post._id))
      // You could show a share link here if returned from the action
      if (result.payload?.shareableLink) {
        console.log('Share link:', result.payload.shareableLink)
      }
    } catch (error) {
      console.error('Error sharing post:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div
      className='
      border-b border-white/10
      px-4 sm:px-6 py-5
    '
    >
      {/* User info */}
      <div className='flex items-center gap-3 mb-3'>
        {/* Placeholder DP */}
        <div
          className='
          w-10 h-10 rounded-full
          bg-white/10
          flex items-center justify-center
          text-xs text-white/70
        '
        >
          {post.username[0].toUpperCase()}
        </div>

        <div className='flex flex-col'>
          <span className='text-sm text-white'>{post.username}</span>
          <span className='text-xs text-gray-400'>
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Post text */}
      <p
        className='
        text-sm sm:text-base
        text-white/90
        leading-relaxed
        mb-4
      '
      >
        {post.textmsg}
      </p>

      {/* Actions */}
      <div
        className='
        flex justify-between
        text-xs sm:text-sm
        text-white/60
      '
      >
        <button
          onClick={handleLike}
          disabled={isLiking}
          className='hover:text-white transition disabled:opacity-50'
        >
          {isLiking ? '❤️ ...' : `❤️ ${post.likes.count}`}
        </button>

        <button className='hover:text-white transition'>
          💬 {post.commentsCount}
        </button>

        <button
          onClick={handleShare}
          disabled={isSharing}
          className='hover:text-white transition disabled:opacity-50'
        >
          {isSharing ? '🔁 ...' : `🔁 ${post.shares.count}`}
        </button>
      </div>
    </div>
  )
}

export default PostCard
