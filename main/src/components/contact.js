import React from 'react';
import { useTheme } from './ThemeContext';
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';

const socials = [
    { name: 'Twitter', url: 'https://twitter.com', icon: <FaTwitter /> },
    { name: 'Facebook', url: 'https://facebook.com', icon: <FaFacebookF /> },
    { name: 'Instagram', url: 'https://instagram.com', icon: <FaInstagram /> },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: <FaLinkedinIn /> },
    { name: 'Whatsapp', url: 'https://wa.me.com', icon: <FaWhatsapp /> },
  ];

const Contact = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer
      className={`w-full py-16 px-4 ${
        isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-200 text-gray-700'
      }`}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Get in Touch with <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>LopCafe</span>
        </h2>

        {/* Contact Info & Socials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="mb-2">Email: <a href="mailto:support@LopCafe.com" className="hover:underline">support:LopCafe@gmail.com</a></p>
            <p className="mb-2">Phone: <a href="tel:+254795970395" className="hover:underline">+254795970395</a></p>
            <p>Address: 23 Coffee Lane, Westlands,Nairobi</p>
          </div>

          {/* Social Media Links */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex justify-center md:justify-end gap-6 flex-wrap">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-semibold transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                      : 'bg-gray-300 text-blue-600 hover:bg-gray-400'
                  }`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className={isDarkMode ? 'text-blue-400' : 'text-gray-600'}>
            © {new Date().getFullYear()} LopCafe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Contact;