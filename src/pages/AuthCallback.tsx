import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Failsafe timeout - force navigation after 8 seconds (increased)
    const failsafeTimer = setTimeout(() => {
      if (!hasNavigated) {
        console.warn('AuthCallback: Timeout reached, forcing navigation');
        setHasNavigated(true);
        navigate('/', { replace: true });
      }
    }, 8000);

    return () => clearTimeout(failsafeTimer);
  }, [hasNavigated, navigate]);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (loading) {
      console.log('AuthCallback: Waiting for auth to load...');
      return;
    }

    // Prevent multiple navigations
    if (hasNavigated) {
      return;
    }

    console.log('AuthCallback: Auth loaded, user:', user ? 'exists' : 'null');

    // Small delay to ensure everything is settled
    const timer = setTimeout(() => {
      if (user) {
        console.log('AuthCallback: User authenticated, navigating to home');
        setHasNavigated(true);
        navigate('/', { replace: true });
      } else {
        console.log('AuthCallback: No user, navigating to auth');
        setHasNavigated(true);
        navigate('/auth', { replace: true });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loading, user, navigate, hasNavigated]);

  return (
    <div className="auth-callback-page">
      <div className="loading-spinner">
        <Loader />
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
