import ProfileHeader from '../Components/ProfileHeader'
import PostCard from '../Components/PostCard'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { fetchUserPosts, clearUserPosts } from '../redux/Posts/postsSlice'
import { fetchProfile, clearProfile } from '../redux/Profile/profileSlice'

function Profile () {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { userPosts, isLoading, error } = useSelector((state) => state.posts)
  const { currentProfile, isOwnProfile, isLoading: profileLoading, error: profileError } = useSelector((state) => state.profile)
  const { username } = useParams()

  useEffect(() => {
    if (username) {
      dispatch(fetchProfile(username))
      dispatch(fetchUserPosts(username))
    }

    // Clear data when component unmounts or username changes
    return () => {
      dispatch(clearUserPosts())
      dispatch(clearProfile())
    }
  }, [dispatch, username])

  // Build profile object from fetched profile data
  // Handle case where profileData might be null
  const profile = currentProfile ? {
    userid: currentProfile.profile?.userid,
    username: currentProfile.profile?.username || username,
    name: currentProfile.profileData?.name || currentProfile.profile?.username || 'User',
    profession: currentProfile.profileData?.profession || 'Not specified',
    dob: currentProfile.profileData?.dateOfBirth ? new Date(currentProfile.profileData.dateOfBirth).toISOString().split('T')[0] : 'Not specified',
    status: currentProfile.profileData?.status || 'Not specified',
    bio: currentProfile.profileData?.status || 'No bio available',
    followers: currentProfile.profileData?.followersCount || 0,
    following: currentProfile.profileData?.followingCount || 0,
    socials: currentProfile.profileData?.socialMediaLinks?.reduce((acc, link) => {
      acc[link.platform] = link.url;
      return acc;
    }, {}) || {}
  } : null

  // Only show loading if we're actually loading and don't have profile data yet
  if (profileLoading && !currentProfile) {
    return (
      <div className='pb-20 flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4'></div>
          <div className='text-white'>Loading profile...</div>
        </div>
      </div>
    )
  }

  // If we have an error and no profile, show error
  if (!profileLoading && !currentProfile && profileError) {
    return (
      <div className='pb-20 flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-red-400 mb-4'>{profileError}</p>
          <button
            onClick={() => dispatch(fetchProfile(username))}
            className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // If profile is still null after loading completes, show a message
  if (!profileLoading && !profile) {
    return (
      <div className='pb-20 flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-white/60'>Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className='pb-20'>
      <ProfileHeader 
        profile={profile} 
        isOwnProfile={isOwnProfile}
        username={username}
      />

      {/* Divider */}
      <div className='max-w-2xl mx-auto my-8 h-px bg-white/10' />

      {/* User Posts */}
      <div className='max-w-2xl mx-auto'>
        {isLoading ? (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-4'></div>
            <p className='text-white/60'>Loading posts...</p>
          </div>
        ) : error ? (
          <div className='text-center py-8'>
            <p className='text-red-400 mb-4'>{error}</p>
            <button
              onClick={() => dispatch(fetchUserPosts(username))}
              className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition'
            >
              Try Again
            </button>
          </div>
        ) : userPosts.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-white/60 mb-4'>No posts yet.</p>
            <p className='text-white/40 text-sm'>This user hasn't posted anything yet.</p>
          </div>
        ) : (
          userPosts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  )
}

export default Profile
