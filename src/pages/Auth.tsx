import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        await signUp(email, password, username);
        navigate('/');
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Navigation will happen automatically after OAuth callback
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <p>{isSignUp ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        <button 
          type="button"
          className="google-auth-button"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FaGoogle /> Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label>
                <FaUser /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
