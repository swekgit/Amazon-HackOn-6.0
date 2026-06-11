import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/' },
    { name: 'Customers', path: '/customers' },
    { name: 'Campaigns', path: '/campaigns' },
    { name: 'Recommendations', path: '/recommendations' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shrink-0">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-indigo-400">
          Amazon HackOn
        </h2>
        <p className="text-xs text-slate-400 mt-1">Customer Intelligence</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 bg-slate-800 rounded-lg text-xs text-slate-400 text-center">
        Platform v1.0
      </div>
    </div>
  );
}