import React, { useState, useEffect } from 'react';
import Api from './api';
import { useTheme } from './ThemeContext';

const BrewMethods = () => {
  const backend = Api();
  const { isDarkMode } = useTheme();
  const [brewMethods, setBrewMethods] = useState([]);
  const [formData, setFormData] = useState({ name: '', details: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadBrewMethods = async () => {
      setIsLoading(true);
      try {
        const data = await backend.fetchBrewMethods();
        if (isMounted) setBrewMethods(data || []);
      } catch (err) {
        console.error('Failed to load brew methods:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadBrewMethods();
    return () => {
      isMounted = false;
    };
  }, [backend]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await backend.createBrewMethod(formData);
      const data = await backend.fetchBrewMethods();
      setBrewMethods(data || []);
      setFormData({ name: '', details: '' });
    } catch (err) {
      console.error('Create brew method error:', err.message);
    }
  };

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-4">Brew Methods</h1>
      {isLoading }
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Details"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Brew Method
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {brewMethods.map((bm) => (
          <div key={bm.id} className="p-4 border rounded-md">
            <h3 className="text-lg font-semibold">{bm.name}</h3>
            <p>{bm.details || 'No details'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrewMethods;