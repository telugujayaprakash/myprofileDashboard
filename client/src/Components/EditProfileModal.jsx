import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X } from 'lucide-react'
import { updateProfile } from '../redux/Profile/profileSlice'
import { fetchProfile } from '../redux/Profile/profileSlice'

function EditProfileModal ({ profile, onClose }) {
  const dispatch = useDispatch()
  const { updateLoading, updateError } = useSelector((state) => state.profile)
  const { user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: profile.name || '',
    profession: profile.profession || '',
    dob: profile.dob !== 'Not specified' ? profile.dob : '',
    status: profile.bio !== 'No bio available' ? profile.bio : '',
    bio: profile.bio !== 'No bio available' ? profile.bio : '',
    instagram: profile.socials?.instagram || '',
    linkedin: profile.socials?.linkedin || '',
    twitter: profile.socials?.twitter || '',
    github: profile.socials?.github || '',
    website: profile.socials?.website || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Build social media links array
    const socialMediaLinks = []
    if (formData.instagram) socialMediaLinks.push({ platform: 'instagram', url: formData.instagram })
    if (formData.linkedin) socialMediaLinks.push({ platform: 'linkedin', url: formData.linkedin })
    if (formData.twitter) socialMediaLinks.push({ platform: 'twitter', url: formData.twitter })
    if (formData.github) socialMediaLinks.push({ platform: 'github', url: formData.github })
    if (formData.website) socialMediaLinks.push({ platform: 'website', url: formData.website })

    const profileData = {
      name: formData.name,
      profession: formData.profession,
      dateOfBirth: formData.dob || null,
      status: formData.status || formData.bio,
      socialMediaLinks
    }

    try {
      await dispatch(updateProfile(profileData))
      // Refresh profile data
      if (user?.username) {
        await dispatch(fetchProfile(user.username))
      }
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
      <div className='bg-[#0B0D0F] rounded-lg w-full max-w-md mx-4 border border-white/10'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-white/10'>
          <h2 className='text-xl text-white font-semibold'>Edit Profile</h2>
          <button
            onClick={onClose}
            className='text-white/60 hover:text-white transition'
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {updateError && (
            <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded text-sm'>
              {updateError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className='block text-sm text-white/80 mb-2'>Name</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white
                focus:outline-none focus:border-white/20
              '
              placeholder='Your name'
            />
          </div>

          {/* Profession */}
          <div>
            <label className='block text-sm text-white/80 mb-2'>Profession</label>
            <input
              type='text'
              name='profession'
              value={formData.profession}
              onChange={handleChange}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white
                focus:outline-none focus:border-white/20
              '
              placeholder='Your profession'
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className='block text-sm text-white/80 mb-2'>Date of Birth</label>
            <input
              type='date'
              name='dob'
              value={formData.dob}
              onChange={handleChange}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white
                focus:outline-none focus:border-white/20
              '
            />
          </div>

          {/* Bio/Status */}
          <div>
            <label className='block text-sm text-white/80 mb-2'>Bio</label>
            <textarea
              name='status'
              value={formData.status}
              onChange={handleChange}
              rows={3}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white
                focus:outline-none focus:border-white/20
                resize-none
              '
              placeholder='Tell us about yourself...'
            />
          </div>

          {/* Social Media Links */}
          <div className='space-y-3 pt-2'>
            <label className='block text-sm text-white/80 mb-2'>Social Media Links</label>
            
            <input
              type='url'
              name='instagram'
              value={formData.instagram}
              onChange={handleChange}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white text-sm
                focus:outline-none focus:border-white/20
              '
              placeholder='Instagram URL'
            />
            
            <input
              type='url'
              name='linkedin'
              value={formData.linkedin}
              onChange={handleChange}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white text-sm
                focus:outline-none focus:border-white/20
              '
              placeholder='LinkedIn URL'
            />
            
            <input
              type='url'
              name='twitter'
              value={formData.twitter}
              onChange={handleChange}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white text-sm
                focus:outline-none focus:border-white/20
              '
              placeholder='Twitter URL'
            />
            
            <input
              type='url'
              name='github'
              value={formData.github}
              onChange={handleChange}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white text-sm
                focus:outline-none focus:border-white/20
              '
              placeholder='GitHub URL'
            />
            
            <input
              type='url'
              name='website'
              value={formData.website}
              onChange={handleChange}
              className='
                w-full px-4 py-2
                bg-white/5 border border-white/10
                rounded-lg text-white text-sm
                focus:outline-none focus:border-white/20
              '
              placeholder='Website URL'
            />
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='
                flex-1 px-4 py-2
                bg-white/5 hover:bg-white/10
                text-white rounded-lg
                transition
              '
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={updateLoading}
              className='
                flex-1 px-4 py-2
                bg-blue-600 hover:bg-blue-700
                text-white rounded-lg
                transition
                disabled:opacity-50 disabled:cursor-not-allowed
              '
            >
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal