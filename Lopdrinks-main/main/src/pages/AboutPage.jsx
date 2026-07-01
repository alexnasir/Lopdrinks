import React, { memo } from 'react';
import { useTheme } from '../context/ThemeContext';
import CountUp from 'react-countup';

const PARTNERS = [
  {
    name: 'BeanCo',
    image: 'premium_photo-1723489233594-d3d7d790c239.avif',
    description:
      'BeanCo supplies our premium single-origin beans, grown sustainably in Ethiopia and Colombia, ensuring rich flavours in every cup.',
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

const STATS = [
  { end: 4.8, decimals: 1, suffix: '/5', label: 'Average Customer Rating', quote: '"LopCafe transformed my morning routine!" – Sarah K.' },
  { end: 10000, separator: ',', suffix: '+', label: 'Happy Customers', quote: '"The best coffee recipes I\'ve ever tried!" – James T.' },
  { end: 95, suffix: '%', label: 'Satisfaction Rate', quote: '"Fast delivery and top-notch quality!" – Maria L.' },
];

/**
 * About page — mirrors the original about.js content exactly.
 */
const AboutPage = memo(() => {
  const { isDarkMode } = useTheme();

  const sectionBg = isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-900';
  const headingColor = isDarkMode ? 'text-blue-400' : 'text-blue-600';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const gradient = isDarkMode
    ? 'bg-gradient-to-r from-blue-400 to-purple-500'
    : 'bg-gradient-to-r from-blue-600 to-indigo-600';

  return (
    <section className={`py-16 px-4 ${sectionBg}`} aria-label="About LopCafe">
      <div className="container mx-auto max-w-6xl">
        <h2 className={`text-4xl md:text-5xl font-extrabold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          About <span className={headingColor}>LopCafe</span>
        </h2>

        {/* Story */}
        <div className="mb-16">
          <h3 className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${headingColor}`}>
            Our Story: Established in 2024
          </h3>
          <p className={`text-lg leading-relaxed max-w-3xl mx-auto text-center ${textColor}`}>
            Founded in 2024, LopCafe was born from a passion for coffee and a vision to revolutionise
            the way coffee enthusiasts experience their daily brew. Starting as a small team of
            dedicated baristas and innovators, we set out to create a platform that celebrates the art
            of coffee-making.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-16">
          <h3 className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${headingColor}`}>
            Loved by Our Community
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STATS.map(({ end, decimals, separator, suffix, label, quote }) => (
              <div key={label} className={`p-6 rounded-lg shadow-md text-center ${cardBg}`}>
                <p className={`text-3xl font-bold mb-2 bg-clip-text text-transparent ${gradient}`}>
                  <CountUp start={0} end={end} decimals={decimals} separator={separator} duration={2.5} suffix={suffix} />
                </p>
                <p className={subText}>{label}</p>
                <p className="mt-2 italic text-sm">{quote}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-16">
          <h3 className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${headingColor}`}>
            Our Trusted Partners
          </h3>
          <p className={`text-lg leading-relaxed max-w-3xl mx-auto text-center mb-8 ${textColor}`}>
            We collaborate with the finest coffee farms, roasters, and artisans to bring you
            unparalleled quality.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PARTNERS.map((p) => (
              <div key={p.name} className={`p-6 rounded-lg shadow-md text-center ${cardBg} hover:shadow-xl transition-shadow duration-300`}>
                <img
                  src={p.image}
                  alt={`${p.name} logo`}
                  className="h-32 mx-auto mb-4 object-contain rounded-2xl"
                  loading="lazy"
                />
                <h4 className={`text-xl font-semibold mb-2 ${headingColor}`}>{p.name}</h4>
                <p className={subText}>{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sourcing */}
        <div className="mb-16">
          <h3 className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${headingColor}`}>
            Where Our Coffee Comes From
          </h3>
          <p className={`text-lg leading-relaxed max-w-3xl mx-auto text-center ${textColor}`}>
            At LopCafe, we source our coffee beans from sustainable farms across Ethiopia, Colombia,
            Brazil, and Indonesia. Each region brings its unique flavour profile, from the fruity notes
            of Ethiopian Yirgacheffe to the rich chocolatey undertones of Colombian Supremo.
          </p>
        </div>

        {/* Process */}
        <div>
          <h3 className={`text-2xl md:text-3xl font-semibold mb-6 text-center ${headingColor}`}>
            Our Craftsmanship
          </h3>
          <p className={`text-lg leading-relaxed max-w-3xl mx-auto text-center ${textColor}`}>
            Our process begins with hand-selecting the finest beans, followed by meticulous roasting
            to unlock their full potential. From bean to cup, we obsess over every detail to ensure
            your coffee experience is nothing short of extraordinary.
          </p>
        </div>
      </div>
    </section>
  );
});

AboutPage.displayName = 'AboutPage';
export default AboutPage;
