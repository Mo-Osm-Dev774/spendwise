function Navbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white shadow flex items-center px-6 gap-3">
      <button
        onClick={onMenuClick}
        className="sm:hidden text-gray-600 hover:text-indigo-600"
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

      <h1 className="text-xl font-bold text-indigo-600">SpendWise</h1>
    </header>
  )
}

export default Navbar