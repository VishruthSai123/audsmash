import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // The session is automatically set by Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_failed');
          return;
        }

        if (session) {
          // Successfully authenticated, redirect to home
          navigate('/');
        } else {
          // No session, redirect to auth
          navigate('/auth');
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        navigate('/auth?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
