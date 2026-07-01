import React from 'react';
import { useTheme } from './ThemeContext';
import CountUp from 'react-countup';

const partners = [
  {
    name: 'BeanCo',
    image: 'premium_photo-1723489233594-d3d7d790c239.avif',
    description:
      'BeanCo supplies our premium single-origin beans, grown sustainably in Ethiopia and Colombia, ensuring rich flavors in every cup.',
  },
  {
    name: 'RoastMasters',
    image: 'photo-1551837818-f52fc6991b70.avif',
    description:
      'RoastMasters perfects our coffee with artisanal roasting techniques, enhancing the natural aroma and taste of our blends.',
  },
  {
    name: 'EcoFarms',
    image: 'istockphoto-627210216-2048x2048.jpg',
    description:
      'EcoFarms partners with us to promote eco-friendly farming, delivering organic beans while preserving the environment.',
  },
  {
    name: 'BrewArt',
    image: 'istockphoto-2171064987-2048x2048.jpg',
    description:
      'BrewArt collaborates on innovative brewing methods, helping us craft recipes that elevate your coffee experience.',
  },
];

const AboutUs = () => {
  const { isDarkMode } = useTheme();

  return (
    <section
      className={`py-16 px-4 ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-900'}`}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <h2
          className={`text-4xl md:text-5xl font-extrabold text-center mb-12 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          About <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>LopCafe</span>
        </h2>

        {/* Our Story */}
        <div className="mb-16">
          <h3
            className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Our Story: Established in 2024
          </h3>
          <p
            className={`text-lg leading-relaxed max-w-3xl mx-auto text-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Founded in 2024, LopCafe was born from a passion for coffee and a vision to revolutionize the way coffee enthusiasts experience their daily brew. Starting as a small team of dedicated baristas and innovators, we set out to create a platform that celebrates the art of coffee-making. From our humble beginnings, we’ve grown into a community-driven brand, committed to delivering exceptional quality and fostering a love for coffee worldwide.
          </p>
        </div>

        {/* Customer Ratings */}
        <div className="mb-16">
          <h3
            className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Loved by Our Community
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div
              className={`p-6 rounded-lg shadow-md text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h4
                className={`text-3xl font-bold mb-2 bg-clip-text text-transparent ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
              >
                <CountUp start={0} end={4.8} decimals={1} duration={2.5} suffix="/5" />
              </h4>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Average Customer Rating
              </p>
              <p className="mt-2 italic text-sm">
                “LopCafe transformed my morning routine!” – Sarah K.
              </p>
            </div>
            <div
              className={`p-6 rounded-lg shadow-md text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h4
                className={`text-3xl font-bold mb-2 bg-clip-text text-transparent ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
              >
                <CountUp start={0} end={10000} duration={2.5} separator="," suffix="+" />
              </h4>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Happy Customers
              </p>
              <p className="mt-2 italic text-sm">
                “The best coffee recipes I’ve ever tried!” – James T.
              </p>
            </div>
            <div
              className={`p-6 rounded-lg shadow-md text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h4
                className={`text-3xl font-bold mb-2 bg-clip-text text-transparent ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
              >
                <CountUp start={0} end={95} duration={2.5} suffix="%" />
              </h4>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Satisfaction Rate
              </p>
              <p className="mt-2 italic text-sm">
                “Fast delivery and top-notch quality!” – Maria L.
              </p>
            </div>
          </div>
        </div>

        {/* Our Partners */}
        <div className="mb-16">
          <h3
            className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Our Trusted Partners
          </h3>
          <p
            className={`text-lg leading-relaxed max-w-3xl mx-auto text-center mb-8 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            We collaborate with the finest coffee farms, roasters, and artisans to bring you unparalleled quality. Our partners share our commitment to sustainability and excellence, ensuring every cup tells a story of craftsmanship.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className={`p-6 rounded-lg shadow-md text-center ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } transition-all duration-300 hover:shadow-xl`}
              >
                <img
                  src={partner.image}
                  alt={`${partner.name} logo`}
                  className=" h-32 mx-auto mb-4 object-contain rounded-2xl"
                />
                <h4
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {partner.name}
                </h4>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Coffee Sourcing */}
        <div className="mb-16">
          <h3
            className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Where Our Coffee Comes From
          </h3>
          <p
            className={`text-lg leading-relaxed max-w-3xl mx-auto text-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            At LopCafe, we source our coffee beans from sustainable farms across Ethiopia, Colombia, Brazil, and Indonesia. Each region brings its unique flavor profile, from the fruity notes of Ethiopian Yirgacheffe to the rich chocolatey undertones of Colombian Supremo. We work directly with farmers to ensure fair trade practices, supporting their communities and preserving the environment.
          </p>
        </div>

        {/* Our Process */}
        <div>
          <h3
            className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Our Craftsmanship
          </h3>
          <p
            className={`text-lg leading-relaxed max-w-3xl mx-auto text-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Our process begins with hand-selecting the finest beans, followed by meticulous roasting to unlock their full potential. Whether you’re brewing with a French press or an espresso machine, our recipes are designed to simplify the process while maximizing flavor. From bean to cup, we obsess over every detail to ensure your coffee experience is nothing short of extraordinary.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;