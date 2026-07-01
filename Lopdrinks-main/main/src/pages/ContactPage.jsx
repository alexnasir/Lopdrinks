import React, { memo } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa';

const SOCIALS = [
  { name: 'Twitter', url: 'https://twitter.com', icon: <FaTwitter aria-hidden="true" /> },
  { name: 'Facebook', url: 'https://facebook.com', icon: <FaFacebookF aria-hidden="true" /> },
  { name: 'Instagram', url: 'https://instagram.com', icon: <FaInstagram aria-hidden="true" /> },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: <FaLinkedinIn aria-hidden="true" /> },
  { name: 'WhatsApp', url: 'https://wa.me', icon: <FaWhatsapp aria-hidden="true" /> },
];

/**
 * Contact / footer page — mirrors the original contact.js.
 */
const ContactPage = memo(() => {
  const { isDarkMode } = useTheme();

  return (
    <footer
      className={`w-full py-16 px-4 ${
        isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-200 text-gray-700'
      }`}
      aria-label="Contact LopCafe"
    >
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Get in Touch with{' '}
          <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>LopCafe</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact details */}
          <address className="text-center md:text-left not-italic">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="mb-2">
              Email:{' '}
              <a href="mailto:support@LopCafe.com" className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
                support:LopCafe@gmail.com
              </a>
            </p>
            <p className="mb-2">
              Phone:{' '}
              <a href="tel:+254795970395" className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
                +254795970395
              </a>
            </p>
            <p>Address: 23 Coffee Lane, Westlands, Nairobi</p>
          </address>

          {/* Social links */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <nav aria-label="Social media links">
              <ul className="flex justify-center md:justify-end gap-6 flex-wrap">
                {SOCIALS.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${s.name}`}
                      className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        isDarkMode
                          ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                          : 'bg-gray-300 text-blue-600 hover:bg-gray-400'
                      }`}
                    >
                      {s.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <p className={`mt-12 text-center ${isDarkMode ? 'text-blue-400' : 'text-gray-600'}`}>
          © {new Date().getFullYear()} LopCafe. All rights reserved.
        </p>
      </div>
    </footer>
  );
});

ContactPage.displayName = 'ContactPage';
export default ContactPage;
