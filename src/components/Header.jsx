import { Eye, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { logout, user } = useAuth();

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '??';
  };

  const getRoleBadge = (role) => {
    if (role === 'doctor') return { label: 'Doctor', bg: 'rgba(61, 169, 252, 0.15)', color: '#3da9fc' };
    return { label: 'Kader', bg: 'rgba(144, 180, 206, 0.2)', color: '#90b4ce' };
  };

  const roleBadge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <Eye size={24} strokeWidth={1.5} />
        <h1>OpticEdge</h1>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Role Badge */}
          <span style={{
            fontSize: '0.65rem', fontWeight: '600', padding: '3px 10px',
            borderRadius: '9999px', background: roleBadge.bg, color: roleBadge.color,
            letterSpacing: '0.03em', textTransform: 'uppercase',
          }}>
            {roleBadge.label}
          </span>

          {/* User Initials Avatar */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255, 255, 254, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.03em',
          }}>
            {getInitials(user.name)}
          </div>

          {/* Logout */}
          <button
            id="logout-button"
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              color: 'rgba(255, 255, 254, 0.7)', fontSize: '0.8rem',
              padding: '6px', borderRadius: '8px', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fffffe'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 254, 0.7)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
