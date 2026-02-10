import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatDate } from '../utils/formatDate'
import { likePost, sharePost, addComment } from '../redux/Posts/postsSlice'

function PostCard({ post }) {
  const dispatch = useDispatch()
  const [isLiking, setIsLiking] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const commentSectionRef = useRef(null)

  // Close comments when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentSectionRef.current && !commentSectionRef.current.contains(event.target)) {
        setShowComments(false)
      }
    }

    if (showComments) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showComments])

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

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || isCommenting) return

    try {
      setIsCommenting(true)
      await dispatch(addComment({ postId: post._id, comment: commentText.trim() }))
      setCommentText('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsCommenting(false)
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
        {/* User DP */}
        {post.displayPicture ? (
          <img
            src={post.displayPicture}
            alt={post.username}
            className='w-10 h-10 rounded-full object-cover'
            onError={(e) => {
              // Fallback to initial if image fails to load
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className={`
          w-10 h-10 rounded-full
          bg-white/10
          flex items-center justify-center
          text-xs text-white/70
        `}
          style={{ display: post.displayPicture ? 'none' : 'flex' }}
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

        <button
          onClick={() => setShowComments(!showComments)}
          className='hover:text-white transition'
        >
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

      {/* Comments Section */}
      {showComments && (
        <div
          ref={commentSectionRef}
          className='mt-4 pt-4 border-t border-white/10'
        >
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className='mb-4'>
            <div className='flex gap-2'>
              <input
                type='text'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder='Add a comment...'
                className='flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30'
                disabled={isCommenting}
              />
              <button
                type='submit'
                disabled={!commentText.trim() || isCommenting}
                className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isCommenting ? '...' : 'Post'}
              </button>
            </div>
          </form>

          {/* Display Comments */}
          <div className='space-y-3 max-h-96 overflow-y-auto pr-2'>
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => (
                <div key={index} className='flex gap-2.5'>
                  {/* Comment User DP */}
                  {comment.displayPicture ? (
                    <img
                      src={comment.displayPicture}
                      alt={comment.username}
                      className='w-8 h-8 rounded-full object-cover flex-shrink-0'
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div
                    className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/70 flex-shrink-0'
                    style={{ display: comment.displayPicture ? 'none' : 'flex' }}
                  >
                    {comment.username[0].toUpperCase()}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='bg-white/5 rounded-lg px-3 py-2'>
                      <a
                        href={`/${comment.username}`}
                        className='text-xs text-white/80 font-medium hover:text-white transition cursor-pointer inline-block'
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = `/${comment.username}`
                        }}
                      >
                        {comment.username}
                      </a>
                      <p className='text-sm text-white/90 mt-1 break-words'>{comment.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-xs text-white/40 text-center py-4'>No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PostCard
