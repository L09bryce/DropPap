import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-light-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-dropbox-blue">DropPap</h1>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 font-medium">
              <span className="text-gray-500 hover:text-[#0061FF] hover:brightness-110 transition-all">
                Features
              </span>
            </a>
            <a href="#solutions" className="text-gray-600 font-medium">
              <span className="text-gray-500 hover:text-[#0061FF] hover:brightness-110 transition-all">
                Solutions
              </span>
            </a>
            <a href="#industries" className="text-gray-600 font-medium">
              <span className="text-gray-500 hover:text-[#0061FF] hover:brightness-110 transition-all">
                Industries
              </span>
            </a>
          </div>

          {/* Right side - Auth links */}
          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-gray-500 font-medium hover:text-[#0061FF] hover:brightness-110 transition-all">
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-white px-6 py-2 rounded-lg font-semibold bg-[#0061FF] hover:bg-blue-700 transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
