import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition ${isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
    }`;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">
      {/* Logo */}
      <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
        RoamEase
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center space-x-2">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/services" className={linkClass}>
          Services
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
        <NavLink to="/help" className={linkClass}>
          Help Center
        </NavLink>
        <NavLink to="/contact" className={linkClass}>
          Contact
        </NavLink>
      </div>

      {/* Desktop Right-aligned Auth Links */}
      <div className="hidden md:flex items-center space-x-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        <NavLink to="/login" className={linkClass}>
          Login
        </NavLink>
        <NavLink to="/signup" className={linkClass}>
          Signup
        </NavLink>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center space-x-2">
        <ThemeToggle />
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Navigation Links */}
            <NavLink to="/" className={mobileLinkClass} onClick={toggleMenu}>
              Home
            </NavLink>
            <NavLink to="/services" className={mobileLinkClass} onClick={toggleMenu}>
              Services
            </NavLink>
            <NavLink to="/about" className={mobileLinkClass} onClick={toggleMenu}>
              About
            </NavLink>
            <NavLink to="/help" className={mobileLinkClass} onClick={toggleMenu}>
              Help Center
            </NavLink>
            <NavLink to="/contact" className={mobileLinkClass} onClick={toggleMenu}>
              Contact
            </NavLink>
            
            {/* Mobile Auth Links */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <NavLink to="/login" className={mobileLinkClass} onClick={toggleMenu}>
                Login
              </NavLink>
              <NavLink to="/signup" className={mobileLinkClass} onClick={toggleMenu}>
                Signup
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;