import { Link, useLocation } from 'react-router-dom';
import { FaTrophy, FaPlus, FaMusic, FaSearch, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: FaTrophy, label: 'Leaderboard' },
    { path: '/listen', icon: FaMusic, label: 'Listen' },
    { path: '/upload', icon: FaPlus, label: 'Add', isCenter: true },
    { path: '/search', icon: FaSearch, label: 'Search' },
    { path: user ? `/profile/${user.id}` : '/auth', icon: FaUser, label: 'Profile' }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        const isCenter = 'isCenter' in item && item.isCenter;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''} ${isCenter ? 'nav-item-center' : ''}`}
          >
            <Icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
