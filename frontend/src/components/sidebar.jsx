import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  // In React Router, we use useLocation instead of usePathname
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'Dashboard' }, // Added dashboard
    { href: '/alerts', label: 'Alerts', icon: 'Alerts'  },
    { href: '/user_management', label: 'Users', icon: 'Users management' },
  ];

  return (
    <aside className="w-40 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-6 gap-8 fixed left-0 top-0 h-screen z-50">
      {/* AI Logo */}
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]">
        AI
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href} // Changed 'href' to 'to'
            className={`py-2 px-6 rounded-lg flex items-center justify-center transition-all text-lg ${
              pathname === item.href
                ? 'bg-blue-600 text-white shadow-lg font-bold'
                : 'text-neutral-500 hover:bg-neutral-800 hover:text-white font-bold'
            }`}
            title={item.label}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
      
      {/* Logout at bottom */}
      <div className="mt-auto">
         <Link to="/login" className="text-neutral-600 text-2xl hover:bg-neutral-600 transition-colors rounded-lg" title='Logout'>
            👤
         </Link>
      </div>
    </aside>
  );
}