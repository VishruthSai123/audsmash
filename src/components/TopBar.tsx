import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import logo from '../assets/audsmash1.png';

export default function TopBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="top-bar">
      <div className="top-bar-content">
        <div className="app-logo" onClick={() => navigate('/')}>
          <img src={logo} alt="AudSmash" className="app-logo-img" />
        </div>

        {user ? (
          <div className="user-menu">
            <button 
              className="menu-button"
              onClick={() => setShowMenu(!showMenu)}
            >
              <FaBars />
            </button>

            {showMenu && (
              <div className="menu-dropdown">
                <div className="menu-item" onClick={() => navigate(`/profile/${user.id}`)}>
                  My Profile
                </div>
                <div className="menu-item" onClick={handleSignOut}>
                  <FaSignOutAlt /> Sign Out
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            className="auth-button-top"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
