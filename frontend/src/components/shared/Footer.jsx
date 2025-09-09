import { Mail, Phone, Truck, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & Description */}
        <div>
          <div className="flex items-center gap-2 text-blue-500 text-xl font-bold mb-4">
            <Truck size={20} />
            RoamEase
          </div>
          <p className="text-sm text-gray-300">
            Smart logistics platform connecting cargo shippers with verified logistics companies. Streamline your cargo movement process with ease.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-300">
            <Mail size={16} />
            <span>akindare2025@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
            <Phone size={16} />
            <span>+2347042168616</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/about" className="hover:text-blue-400 transition-colors duration-200">About Us</Link></li>
            <li><Link to="/services" className="hover:text-blue-400 transition-colors duration-200">Services</Link></li>
            <li><Link to="/pricing" className="hover:text-blue-400 transition-colors duration-200">Pricing</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors duration-200">Contact</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="font-semibold text-white mb-3">Support</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/help" className="hover:text-blue-400 transition-colors duration-200">Help Center</Link></li>
            <li><Link to="/terms" className="hover:text-blue-400 transition-colors duration-200">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-blue-400 transition-colors duration-200">Privacy Policy</Link></li>
            <li><Link to="/faq" className="hover:text-blue-400 transition-colors duration-200">FAQ</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200"><Facebook size={20} /></a>
            <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200"><Twitter size={20} /></a>
            <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200"><Instagram size={20} /></a>
            <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} RoamEase. All rights reserved. | <Link to="/privacy" className="hover:text-blue-400 transition-colors duration-200">Privacy Policy</Link> | <Link to="/terms" className="hover:text-blue-400 transition-colors duration-200">Terms of Service</Link>
      </div>
    </footer>
  );
};

export default Footer;
