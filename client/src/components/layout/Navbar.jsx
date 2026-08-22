import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import { 
  Menu, X, User, LayoutDashboard, Pill, MapPin, 
  FileText, Receipt, Package, FilePlus, Settings, LogOut 
} from 'lucide-react';

const navConfig = {
  CUSTOMER: [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Nearby Pharmacies', path: '/pharmacies/nearby', icon: MapPin },
    { name: 'My Requests', path: '/customer/requests', icon: FilePlus },
    { name: 'Orders', path: '/customer/orders', icon: Package },
  ],
  PHARMACY: [
    { name: 'Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
    { name: 'Requests', path: '/pharmacy/inbox', icon: FilePlus },
    { name: 'Quotations', path: '/pharmacy/quotations', icon: Receipt },
    { name: 'Orders', path: '/pharmacy/orders', icon: Package },
    { name: 'Availability', path: '/pharmacy/availability', icon: Pill },
    { name: 'Location', path: '/pharmacy/location', icon: MapPin },
    { name: 'Profile', path: '/pharmacy/profile', icon: Settings },
  ],
  ADMIN: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Pharmacies', path: '/admin/pharmacies', icon: MapPin },
    { name: 'Medicines', path: '/admin/medicines', icon: Pill },
    { name: 'Payments', path: '/admin/payments', icon: Receipt },
  ]
};

const publicNav = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
];

function Navbar() {
  const { isAuthenticated, logout, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navItems = isAuthenticated && role ? navConfig[role] : publicNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const NavLink = ({ item, mobile }) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    const Icon = item.icon;
    
    return (
      <Link
        to={item.path}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "flex items-center transition-colors font-medium",
          mobile 
            ? "px-4 py-3 rounded-lg text-base w-full"
            : "px-3 py-2 rounded-md text-sm",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        {Icon && <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary-600" : "text-slate-400")} />}
        {item.name}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Cure<span className="text-primary-600">Link</span></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 mx-6">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              
              {/* Profile Dropdown */}
              <div className="relative hidden sm:block">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <User className="h-4 w-4 text-slate-600" />
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg outline-none">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate capitalize">{role?.toLowerCase()}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register/customer">
                <Button variant="primary">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} mobile />
            ))}
            
            {!isAuthenticated ? (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col space-y-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/register/customer" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Sign up</Button>
                </Link>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center px-4 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-slate-800">{user?.name || 'User'}</div>
                    <div className="text-sm font-medium text-slate-500 capitalize">{role?.toLowerCase()}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center rounded-lg px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
