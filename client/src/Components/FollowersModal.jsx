import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../utils/tokenHandler'

function FollowersModal({ type, userIds, onClose }) {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUsernames = async () => {
            if (!userIds || userIds.length === 0) {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                // Fetch user details for each userId
                const userPromises = userIds.map(async (userId) => {
                    try {
                        const response = await fetchWithAuth(
                            `${import.meta.env.VITE_BASE_URL}/api/users/user-by-id/${userId}`,
                            { method: 'GET' }
                        )

                        if (response.ok) {
                            const data = await response.json()
                            return data.user
                        }
                        return null
                    } catch (err) {
                        console.error(`Error fetching user ${userId}:`, err)
                        return null
                    }
                })

                const fetchedUsers = await Promise.all(userPromises)
                setUsers(fetchedUsers.filter(user => user !== null))
            } catch (err) {
                setError('Failed to load users')
                console.error('Error fetching users:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUsernames()
    }, [userIds])

    const handleUserClick = (username) => {
        onClose()
        navigate(`/${username}`)
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#1a1d21] rounded-lg w-full max-w-md max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-white text-lg font-medium">
                        {type === 'followers' ? 'Followers' : 'Following'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-4"></div>
                            <p className="text-white/60 text-sm">Loading...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-white/60 text-sm">
                                No {type === 'followers' ? 'followers' : 'following'} yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {users.map((user) => (
                                <button
                                    key={user.userid}
                                    onClick={() => handleUserClick(user.username)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                                >
                                    {/* Avatar */}
                                    <div className="relative w-10 h-10 flex-shrink-0">
                                        {user.displayPicture ? (
                                            <>
                                                <img
                                                    src={user.displayPicture}
                                                    alt={user.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none'
                                                        e.target.nextElementSibling.style.display = 'flex'
                                                    }}
                                                />
                                                <div className="w-10 h-10 rounded-full bg-white/10 hidden items-center justify-center text-white text-sm absolute top-0 left-0">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 text-left">
                                        <p className="text-white text-sm font-medium">
                                            {user.username}
                                        </p>
                                        {user.name && (
                                            <p className="text-white/60 text-xs">{user.name}</p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FollowersModal
