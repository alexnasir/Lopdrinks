import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { categoryService } from '../services';
import { Loader } from '../components/feedback';
import { ROUTES } from '../constants';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

/**
 * Admin page — full CRUD for categories.
 * Route: /admin/categories  (adminOnly)
 */
const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Inline-edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const bg = isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const inputCls = 'w-full rounded-md border border-gray-300 p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm';

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Create ─────────────────────────────────────────────────────────── */
  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await categoryService.create({ name });
      toast.success(`Category "${name}" created.`);
      setNewName('');
      setShowCreate(false);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to create category.');
    } finally {
      setCreating(false);
    }
  }, [newName, load]);

  /* ── Update ─────────────────────────────────────────────────────────── */
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleUpdate = useCallback(async (id) => {
    const name = editName.trim();
    if (!name) return;
    setSavingId(id);
    try {
      await categoryService.update(id, { name });
      toast.success('Category updated.');
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to update.');
    } finally {
      setSavingId(null);
    }
  }, [editName, load]);

  /* ── Delete ─────────────────────────────────────────────────────────── */
  const handleDelete = useCallback(async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Recipes in this category will lose their category.`)) return;
    setSavingId(id);
    try {
      await categoryService.remove(id);
      toast.success(`Category "${name}" deleted.`);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    } finally {
      setSavingId(null);
    }
  }, [load]);

  return (
    <main className={`min-h-screen p-6 ${bg}`}>
      <button
        onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
        className="flex items-center gap-2 mb-6 text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        aria-label="Back to dashboard"
      >
        <FaArrowLeft aria-hidden="true" /> Admin Dashboard
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Manage Categories</h1>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-expanded={showCreate}
          >
            <FaPlus aria-hidden="true" />
            {showCreate ? 'Cancel' : 'New Category'}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className={`mb-6 rounded-xl p-4 shadow-sm ${cardBg}`}
            aria-label="Create category form"
          >
            <label htmlFor="new-cat-name" className="block text-sm font-medium mb-1">
              Category name
            </label>
            <div className="flex gap-2">
              <input
                id="new-cat-name"
                type="text"
                className={inputCls}
                placeholder="e.g. Iced Specials"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Save new category"
              >
                {creating ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <Loader />
        ) : categories.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No categories yet. Create one above.</p>
        ) : (
          <ul className="space-y-3" aria-label="Categories list">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm ${cardBg}`}
              >
                {editingId === cat.id ? (
                  /* Inline edit */
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleUpdate(cat.id); }}
                    className="flex flex-1 items-center gap-2"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <input
                      type="text"
                      className={inputCls}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      aria-label="Category name"
                    />
                    <button
                      type="submit"
                      disabled={savingId === cat.id}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      aria-label="Save changes"
                    >
                      <FaCheck aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-gray-400 px-3 py-2 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      aria-label="Cancel edit"
                    >
                      <FaTimes aria-hidden="true" />
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 font-medium">{cat.name}</span>
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded-lg bg-amber-500 px-3 py-2 text-sm text-white hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
                      aria-label={`Edit category ${cat.name}`}
                    >
                      <FaEdit aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={savingId === cat.id}
                      className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label={`Delete category ${cat.name}`}
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default AdminCategoriesPage;
