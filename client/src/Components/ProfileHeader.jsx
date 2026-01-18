import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Edit2 } from 'lucide-react'
import { socialIcons } from '../utils/socialIcons'
import { followUser, unfollowUser, fetchProfile } from '../redux/Profile/profileSlice'
import EditProfileModal from './EditProfileModal'

function ProfileHeader ({ profile, isOwnProfile, username }) {
  const dispatch = useDispatch()
  const { followLoading, followError } = useSelector((state) => state.profile)
  const { user } = useSelector((state) => state.auth)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Get follow status from profile data
  const currentProfile = useSelector((state) => state.profile.currentProfile)
  const isFollowingFromRedux = currentProfile?.isFollowing
  
  useEffect(() => {
    if (!isOwnProfile && currentProfile) {
      // Update local state from Redux state
      setIsFollowing(isFollowingFromRedux || false)
    } else if (isOwnProfile) {
      setIsFollowing(false) // Can't follow yourself
    }
  }, [isOwnProfile, isFollowingFromRedux, currentProfile])

  const handleFollow = async () => {
    try {
      const result = await dispatch(followUser(username))
      
      // Check if the action was fulfilled
      if (result.type === 'profile/followUser/fulfilled') {
        // Update local state immediately
        setIsFollowing(true)
        // Refresh profile to get updated follower count
        await dispatch(fetchProfile(username))
      } else if (result.type === 'profile/followUser/rejected') {
        // Show error message
        console.error('Failed to follow user:', result.payload || result.error)
      }
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const handleUnfollow = async () => {
    try {
      const result = await dispatch(unfollowUser(username))
      
      // Check if the action was fulfilled
      if (result.type === 'profile/unfollowUser/fulfilled') {
        // Update local state immediately
        setIsFollowing(false)
        // Refresh profile to get updated follower count
        await dispatch(fetchProfile(username))
      } else if (result.type === 'profile/unfollowUser/rejected') {
        // Show error message
        console.error('Failed to unfollow user:', result.payload || result.error)
      }
    } catch (error) {
      console.error('Error unfollowing user:', error)
    }
  }

  return (
    <div className='max-w-2xl mx-auto px-4 pt-6 relative'>
      {/* Edit/Follow Button - Right side */}
      <div className='absolute top-6 right-4'>
        {isOwnProfile ? (
          <button
            onClick={() => setShowEditModal(true)}
            className='
              px-4 py-2
              bg-white/10 hover:bg-white/20
              text-white text-sm
              rounded-lg
              flex items-center gap-2
              transition
            '
          >
            <Edit2 size={16} />
            Edit
          </button>
        ) : (
          <div className='flex flex-col items-end gap-2'>
            {followError && (
              <p className='text-red-400 text-xs'>{followError}</p>
            )}
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              disabled={followLoading}
              className='
                px-4 py-2
                bg-blue-600 hover:bg-blue-700
                text-white text-sm
                rounded-lg
                transition
                disabled:opacity-50 disabled:cursor-not-allowed
              '
            >
              {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        )}
      </div>

      {/* DP */}
      <div className='flex flex-col items-center'>
        <div
          className='
          w-24 h-24 rounded-full
          bg-white/10
          flex items-center justify-center
          text-2xl text-white
        '
        >
          {profile.username[0].toUpperCase()}
        </div>

        <h2 className='mt-4 text-lg text-white'>{profile.username}</h2>
      </div>

      {/* Followers / Following */}
      <div className='flex justify-center gap-8 mt-6 text-sm'>
        <div className='text-center'>
          <p className='text-white'>{profile.followers}</p>
          <p className='text-gray-400'>Followers</p>
        </div>

        <div className='text-center'>
          <p className='text-white'>{profile.following}</p>
          <p className='text-gray-400'>Following</p>
        </div>
      </div>

      {/* Social Icons */}
      <div className='flex justify-center gap-5 mt-6'>
        {Object.entries(profile.socials).map(([key, url]) => {
          const Icon = socialIcons[key]
          if (!Icon) return null

          return (
            <a
              key={key}
              href={url}
              target='_blank'
              rel='noreferrer'
              className='
                text-white/60
                hover:text-white
                transition
              '
            >
              <Icon size={20} />
            </a>
          )
        })}
      </div>

      {/* Bio */}
      <div
        className='
        mt-6 text-center
        text-sm text-white/80
      '
      >
        {profile.bio}
      </div>

      {/* Info */}
      <div
        className='
        mt-4
        text-xs text-gray-400
        flex flex-wrap justify-center gap-x-4 gap-y-1
      '
      >
        <span>{profile.name}</span>
        <span>{profile.profession}</span>
        <span>DOB: {profile.dob}</span>
        <span>{profile.status}</span>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}

export default ProfileHeader
