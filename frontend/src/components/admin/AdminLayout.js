import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Bell, 
  BarChart3, 
  Home,
  Menu,
  X,
  Settings,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: Home },
    { name: 'User Management', to: '/admin/users', icon: Users },
    { name: 'Question Editor', to: '/admin/questions', icon: BookOpen },
    { name: 'Notifications', to: '/admin/notifications', icon: Bell },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          Admin Panel
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Admin Panel
              </h2>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                variant="ghost"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col">
            {/* Logo */}
            <div className="px-6 py-8 border-b border-gray-200">
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-500 mt-1">Learning Management System</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="px-4 py-4 border-t border-gray-200">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

