import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
    }`;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        RoamEase
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-2">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/services" className={linkClass}>
          Services
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
        <NavLink to="/faq" className={linkClass}>
          FAQ
        </NavLink>
      </div>

      {/* Right-aligned Auth Links */}
      <div className="flex items-center space-x-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        <NavLink to="/login" className={linkClass}>
          Login
        </NavLink>
        <NavLink to="/signup" className={linkClass}>
          Signup
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
