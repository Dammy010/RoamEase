import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-blue-600">
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
      <div className="flex space-x-2">
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
