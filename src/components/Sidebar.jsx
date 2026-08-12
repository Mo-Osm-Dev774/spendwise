import { NavLink } from 'react-router-dom'

const links = [
  { name: 'Dashboard', path: '/' },
  { name: 'Transactions', path: '/transactions' },
  { name: 'Budget', path: '/budget' },
  { name: 'Analytics', path: '/analytics' },
]

function Sidebar() {
  return (
    <aside className="w-56 bg-white shadow h-full p-4 hidden sm:block">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
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
  )
}

export default Sidebar