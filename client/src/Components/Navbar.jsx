import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/Auth/authSlice'

function Sidebar() {
  const [open, setOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to sign out?')
    if (confirmed) {
      dispatch(logout())
      setOpen(false)
      navigate('/')
    }
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className='md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B0D0F] px-4 py-3 flex items-center'>
        <button onClick={() => setOpen(true)}>
          <Menu className='text-white' size={22} />
        </button>
        <span className='ml-4 text-sm text-white/80'>Menu</span>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className='fixed inset-0 bg-black/60 z-40 md:hidden'
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-full w-64
          bg-[#0B0D0F]
          border-r border-white/10
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className='px-6 py-5 border-b border-white/10 text-white text-sm'>
          Your App
          <button
            className='md:hidden float-right'
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className='mt-6 flex flex-col'>
          <NavLink
            to='/feed'
            className={({ isActive }) =>
              `px-6 py-3 text-sm tracking-wide transition
               ${isActive
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
            onClick={() => setOpen(false)}
          >
            Feed
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `px-6 py-3 text-sm transition
     ${isActive
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/5'}`
            }
          >
            Search
          </NavLink>


          <NavLink
            to='/create'
            className={({ isActive }) =>
              `px-6 py-3 text-sm tracking-wide transition
               ${isActive
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
            onClick={() => setOpen(false)}
          >
            Create Post
          </NavLink>

          <NavLink
            to={`/${user?.username}`}
            className={({ isActive }) =>
              `px-6 py-3 text-sm tracking-wide transition
               ${isActive
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
            onClick={() => setOpen(false)}
          >
            {user?.username || 'Profile'}
          </NavLink>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className='px-6 py-3 text-sm tracking-wide transition text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 mt-auto'
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
