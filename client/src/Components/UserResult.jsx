import { useNavigate } from 'react-router-dom'

function UserResult ({ user }) {
  const navigate = useNavigate()

  const handleClick = () => {
    // Navigate to username URL (e.g., /lavanya)
    navigate(`/${user.username}`)
  }

  return (
    <div
      onClick={handleClick}
      className="
        flex items-center gap-4
        py-4 border-b border-white/10
        hover:bg-white/5 transition
        cursor-pointer
      "
    >
      {/* DP */}
      <div className="
        w-10 h-10 rounded-full
        bg-white/10
        flex items-center justify-center
        text-white
      ">
        {user.username[0].toUpperCase()}
      </div>

      {/* Info */}
      <div>
        <p className="text-white text-sm">
          {user.username}
        </p>
        <p className="text-xs text-gray-400">
          {user.profession}
        </p>
      </div>
    </div>
  )
}

export default UserResult
