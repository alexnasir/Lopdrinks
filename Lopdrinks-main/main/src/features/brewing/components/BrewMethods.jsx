import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { brewService } from '../../../services';
import toast from 'react-hot-toast';

/**
 * Admin-only brew-methods management panel.
 */
const BrewMethods = () => {
  const { isDarkMode } = useTheme();
  const [brewMethods, setBrewMethods] = useState([]);
  const [formData, setFormData] = useState({ name: '', details: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    brewService
      .getAll()
      .then((data) => { if (active) setBrewMethods(data); })
      .catch((err) => toast.error(err.message))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      await brewService.create(formData);
      const data = await brewService.getAll();
      setBrewMethods(data);
      setFormData({ name: '', details: '' });
      toast.success('Brew method added');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <main
      className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
      aria-label="Brew methods management"
    >
      <h1 className="text-2xl font-bold mb-4">Brew Methods</h1>
      {isLoading && <p aria-live="polite">Loading…</p>}

      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6" aria-label="Add brew method">
        <div className="mb-4">
          <label htmlFor="bm-name" className="block text-sm font-medium mb-1">Name</label>
          <input
            id="bm-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Brew method name"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="bm-details" className="block text-sm font-medium mb-1">Details</label>
          <textarea
            id="bm-details"
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="Description (optional)"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Add Brew Method
        </button>
      </form>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Brew methods list">
        {brewMethods.map((bm) => (
          <li key={bm.id} className="p-4 border rounded-md">
            <h3 className="text-lg font-semibold">{bm.name}</h3>
            <p>{bm.details || 'No details'}</p>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default BrewMethods;
