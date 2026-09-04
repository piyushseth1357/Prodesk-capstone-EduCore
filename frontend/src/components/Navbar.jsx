import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Compass, Menu, X, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-indigo-400">
              <BookOpen className="h-6 w-6 text-indigo-400" />
              <span>EduCore</span>
            </Link>

            <Link
              to="/courses"
              className="hidden md:flex items-center space-x-1.5 text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
            >
              <Compass className="h-4 w-4 text-indigo-400" />
              <span>Courses Directory</span>
            </Link>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {token && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-700">
                  <User className="h-4 w-4 text-indigo-300" />
                  <span>{user.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    user.role === 'instructor' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-xs font-medium transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 px-4 pt-2 pb-4 space-y-2 border-t border-slate-700">
          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            Courses Directory
          </Link>

          {token && user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-200 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Dashboard
              </Link>
              <div className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-indigo-300">
                <span>{user.name} ({user.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-200 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-base font-medium text-center"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
