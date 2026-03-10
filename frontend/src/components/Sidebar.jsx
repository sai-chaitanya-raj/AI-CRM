import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Trello, CheckSquare, BarChart2, Settings, Sparkles } from 'lucide-react';
import { cn } from '../utils/utils';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/' },
    { label: 'Leads', icon: Users, path: '/leads' },
    { label: 'Pipeline', icon: Trello, path: '/pipeline' },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900/50 flex flex-col pt-6 backdrop-blur-md">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center space-x-3">
        <div className="bg-primary-600 p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Nova CRM</h1>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-gray-800 text-primary-500 shadow-sm" 
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-100"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors", 
                isActive ? "text-primary-500" : "text-gray-500 group-hover:text-gray-300"
              )} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Snippet (Bottom) */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="h-9 w-9 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-inner">
            SC
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-200">Sai Chaitanya</span>
            <span className="text-xs text-gray-500">Free Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
