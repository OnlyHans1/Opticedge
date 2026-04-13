import { NavLink } from 'react-router-dom';
import { Home, Camera, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav className="bottom-nav" id="main-navigation">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={22} />
        <span>Dashboard</span>
      </NavLink>

      {/* Only show Screening tab for workers */}
      {user?.role === 'worker' && (
        <NavLink
          to="/screening"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Camera size={22} />
          <span>Screening</span>
        </NavLink>
      )}

      <NavLink
        to="/patients"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Users size={22} />
        <span>{user?.role === 'doctor' ? 'Reviews' : 'Patients'}</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
