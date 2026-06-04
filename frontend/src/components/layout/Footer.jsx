import { Link } from 'react-router-dom';
import { ChefHat, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                SmartSeat
              </span>
            </Link>
            <p className="text-gray-500 text-sm max-w-md leading-relaxed">
              Intelligent restaurant reservation platform that reduces waiting times
              and helps restaurants maximize seating efficiency with smart table allocation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Restaurants', 'My Bookings', 'Waitlist'].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@smartseat.com"
                  className="text-sm text-gray-500 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> hello@smartseat.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} SmartSeat. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with ❤️ for smart dining
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
