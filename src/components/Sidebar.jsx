import { NavLink } from 'react-router-dom'

const links = [
  { name: 'Dashboard', path: '/' },
  { name: 'Transactions', path: '/transactions' },
  { name: 'Budget', path: '/budget' },
  { name: 'Analytics', path: '/analytics' },
]

function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-20 sm:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed sm:static top-0 left-0 h-full w-56 bg-white shadow p-4 z-30
          transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0
        `}
      >
        <nav className="flex flex-col gap-2 mt-14 sm:mt-0">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar