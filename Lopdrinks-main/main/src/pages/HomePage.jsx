import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from '../constants/routes';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';

const IMAGES = [
  '/cof1.jpg',
  '/cof234567.jpg',
  '/coff4.jpg',
  '/cofff1.jpg',
];

/**
 * Landing / home page.
 * Composes the About and Contact sections inline (same as original LandingPage.js).
 */
const HomePage = memo(() => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState(IMAGES[0]);

  const handleImageClick = useCallback((img) => setMainImage(img), []);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {/* Hero */}
      <section
        className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-16 bg-cover bg-center"
        style={{ backgroundImage: `url(${mainImage})` }}
        aria-label="Hero section"
      >
        <div className="lg:w-1/2 text-center lg:text-left max-w-2xl p-6 lg:p-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Welcome to{' '}
            <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>LopCafe</span>
          </h1>
          <p className="text-lg text-blue-400 md:text-xl mb-8 leading-relaxed">
            Discover the art of coffee with our specialised application, offering an exceptional
            experience for coffee enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={() => navigate(ROUTES.SIGNUP)}
              className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              Get Started
            </button>
            <button
              onClick={() => navigate(ROUTES.ABOUT)}
              className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 border-2 ${
                isDarkMode
                  ? 'border-blue-400 text-blue-400 hover:bg-gray-800'
                  : 'border-blue-500 text-blue-500 hover:bg-blue-50'
              } focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              About Us
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 h-[600px] p-6" aria-hidden="true">
          <img
            src={mainImage}
            alt="Featured Coffee"
            className="w-full h-full object-cover rounded-lg shadow-xl"
          />
        </div>
      </section>

      {/* Image Picker */}
      <section
        className={`py-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        aria-label="Choose background image"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-2xl text-purple-600 font-extrabold mb-4">Choose me:</h2>
          <div className="flex justify-center gap-4 flex-wrap" role="list">
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => handleImageClick(img)}
                aria-label={`Select coffee image ${i + 1}`}
                aria-pressed={mainImage === img}
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  mainImage === img ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'
                } transition-all duration-300`}
              >
                <img src={img} alt={`Coffee ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
        aria-label="Why choose LopCafe"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose LopCafe?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Explore Recipes',
                desc: 'Browse our collection of unique coffee recipes.',
                action: () => navigate(ROUTES.RECIPES),
                actionLabel: 'Explore',
              },
              { title: 'Create Your Own', desc: 'Mix ingredients to craft your perfect brew.' },
              { title: 'Fast Delivery', desc: 'Get your coffee delivered right to your door.' },
            ].map(({ title, desc, action, actionLabel }) => (
              <div
                key={title}
                className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{desc}</p>
                {action && (
                  <button
                    onClick={action}
                    className={`mt-3 px-6 py-2 rounded-full text-base font-semibold border-2 transition-all duration-300 ${
                      isDarkMode
                        ? 'border-blue-400 text-blue-400 hover:bg-gray-800'
                        : 'border-blue-500 text-blue-500 hover:bg-blue-50'
                    } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  >
                    {actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Embedded About + Contact */}
      <AboutPage />
      <ContactPage />
    </div>
  );
});

HomePage.displayName = 'HomePage';
export default HomePage;
