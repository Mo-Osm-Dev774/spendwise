import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/analytics': 'Analytics',
}

function Navbar({ onMenuClick }) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const pageTitle = PAGE_TITLES[location.pathname] || 'SpendWise'
  const displayName = user?.user_metadata?.full_name || user?.email || ''

  async function handleLogout() {
    await signOut()
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-800 shadow flex items-center justify-between px-6 gap-3">
      {/* Left: hamburger (mobile) + current page name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="sm:hidden text-gray-600 dark:text-gray-300 hover:text-indigo-600"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {pageTitle}
        </h1>
      </div>

      {/* Right: theme toggle + user name + logout */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="text-gray-500 dark:text-gray-300 hover:text-indigo-600"
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {displayName && (
          <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">
            {displayName}
          </span>
        )}

        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar