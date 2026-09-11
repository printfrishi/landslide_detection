import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/** Access the authenticated user and auth actions. Must be used inside AuthProvider. */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
