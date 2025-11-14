import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loader from '../components/Loader';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Wait a bit for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // The session is automatically set by Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_failed', { replace: true });
          return;
        }

        if (session) {
          // Wait for profile creation to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Successfully authenticated, redirect to home
          navigate('/', { replace: true });
        } else {
          // No session, redirect to auth
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        navigate('/auth?error=callback_failed', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (!isProcessing) {
    return null;
  }

  return (
    <div className="auth-callback-page">
      <div className="loading-spinner">
        <Loader />
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
