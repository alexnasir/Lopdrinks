import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { useNavigate } from 'react-router-dom';
import Contact from './contact';
import AboutUs from './about';

const images = [
  '/cof1.jpg',
  '/cof234567.jpg',
  '/coff4.jpg',
  '/cofff1.jpg',
];

const LandingPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState(images[0]); 

  const handleGetStarted = () => {
    navigate('/signup');
  };
  const handleAboutUs = () => {
    navigate('/about');
  };
  const handleExplore = () => {
    navigate('/recipes');
  };

  const handleImageClick = (image) => {
    setMainImage(image); 
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <section
        className={`flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-16 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
        } sm:bg-cover sm:bg-center`}
        style={{
          backgroundImage: `url(${mainImage})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="lg:w-1/2 text-center lg:text-left max-w-2xl p-6 lg:p-0 sm:rounded-lg">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Welcome to <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>LopCafe</span>
          </h1>
          <p className="text-lg text-blue-400 md:text-xl mb-8 leading-relaxed">
            Discover the art of coffee with our specialized application, offering an exceptional experience for coffee enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={handleGetStarted}
              className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white shadow-lg hover:shadow-xl`}
            >
              Get Started
            </button>
            <button
              onClick={handleAboutUs}
              className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 border-2 ${
                isDarkMode ? 'border-blue-400 text-blue-400 hover:bg-gray-800' : 'border-blue-500 text-blue-500 hover:bg-blue-50'
              }`}
            >
              About Us
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 h-[600px] p-6">
          <img
            src={mainImage}
            alt="Featured Coffee"
            className="w-full h-full object-cover rounded-lg shadow-xl"
          />
        </div>
      </section>

      <section className={`py-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
        <h2 className='text-2xl text-purple-600 font-extrabold'>Choose me :</h2>

          <div className="flex justify-center gap-4 flex-wrap">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Coffee ${index + 1}`}
                className={`w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md cursor-pointer transition-all duration-300 ${
                  mainImage === image ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'
                }`}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose LopCafe?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className="font-semibold text-lg mb-2">Explore Recipes</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Browse our collection of unique coffee recipes.
              </p>
              <button
              onClick={handleExplore}
              className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 border-2 ${
                isDarkMode ? 'border-blue-400 text-blue-400 hover:bg-gray-800' : 'border-blue-500 text-blue-500 hover:bg-blue-50'
              }`}
            >
              Explore
            </button>
            </div>
            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className="font-semibold text-lg mb-2">Create Your Own</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Mix ingredients to craft your perfect brew.
              </p>
            </div>
            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Get your coffee delivered right to your door.
              </p>
            </div>
          </div>
        </div>
      </section>
      <AboutUs />
      <Contact />
    </div>
  );
};

export default LandingPage;