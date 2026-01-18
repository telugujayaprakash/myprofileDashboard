import React, { useState } from 'react'
import { postsAPI } from '../utils/api'

function CreatePost() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handlePost = async () => {
    if (!text.trim()) return

    try {
      setLoading(true)
      setError('')
      setSuccess(false)

      const response = await postsAPI.create({
        textmsg: text.trim()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || 'Failed to create post. Please try again.')
        return
      }

      const data = await response.json()
      console.log('Post created:', data)

      setSuccess(true)
      setText('')

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (err) {
      console.error('Error creating post:', err)
      setError('Failed to create post. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-2xl mx-auto mt-6 px-4'>
      <div
        className='
        bg-[#0F1113]
        border border-white/10
        rounded-xl
        p-4 sm:p-5
      '
      >
        {/* Success Message */}
        {success && (
          <div className='mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg'>
            <p className='text-green-400 text-sm'>Post created successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className='mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}

        {/* Textarea */}
        <textarea
          rows='3'
          placeholder="What's on your mind?"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={loading}
          className='
            w-full bg-transparent
            text-white placeholder:text-gray-500
            resize-none
            focus:outline-none
            text-sm sm:text-base
            disabled:opacity-50
          '
        />

        {/* Divider */}
        <div className='h-px bg-white/10 my-4' />

        {/* Action */}
        <div className='flex justify-end'>
          <button
            onClick={handlePost}
            disabled={!text.trim() || loading}
            className={`
              px-6 py-2
              text-xs sm:text-sm tracking-wide
              border border-white/30
              transition
              ${
                text.trim() && !loading
                  ? 'text-white hover:border-white'
                  : 'text-white/40 border-white/10 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <div className='flex items-center gap-2'>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Posting...
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
