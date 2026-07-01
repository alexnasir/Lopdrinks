/**
 * Thin re-export so feature code imports from hooks/, not context/ directly.
 * Keeps the dependency direction clean: hooks/ → context/.
 */
export { useAuth as default } from '../context/AuthContext';
