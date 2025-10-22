import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User, LogIn, UserPlus } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="group flex-shrink-0">
            <Logo
              size="md"
              animated={true}
              className="group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
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
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            <NavLink
              to="/login"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </NavLink>
            <NavLink
              to="/signup"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </NavLink>
          </div>

          {/* Tablet Navigation Links - Show on md screens, hide on lg+ */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/services" className={linkClass}>
              Services
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
          </div>

          {/* Tablet Right-aligned Auth Links - Show on md screens, hide on lg+ */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            <NavLink
              to="/login"
              className="flex items-center space-x-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </NavLink>
            <NavLink
              to="/signup"
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Up</span>
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Links */}
              <NavLink to="/" className={mobileLinkClass} onClick={toggleMenu}>
                Home
              </NavLink>
              <NavLink
                to="/services"
                className={mobileLinkClass}
                onClick={toggleMenu}
              >
                Services
              </NavLink>
              <NavLink
                to="/about"
                className={mobileLinkClass}
                onClick={toggleMenu}
              >
                About
              </NavLink>
              <NavLink
                to="/help"
                className={mobileLinkClass}
                onClick={toggleMenu}
              >
                Help Center
              </NavLink>
              <NavLink
                to="/contact"
                className={mobileLinkClass}
                onClick={toggleMenu}
              >
                Contact
              </NavLink>

              {/* Mobile Auth Links */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <NavLink
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mt-2"
                  onClick={toggleMenu}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
