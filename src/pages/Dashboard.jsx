import { Activity, Clock, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiGetScreenings } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        const data = await apiGetScreenings();
        setScreenings(data);
      } catch (error) {
        console.error('Failed to load screenings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScreenings();
  }, [user]);

  const pendingCount = screenings.filter(s => s.doc_validation === 'pending').length;
  const approvedCount = screenings.filter(s => s.doc_validation === 'approved' || s.doc_validation === 'revised').length;
  const recentScreenings = screenings.slice(0, 3);

  const getRoleName = () => {
    if (user.role === 'worker') return 'Tenaga Medis / Kader';
    if (user.role === 'doctor') return 'Spesialis Mata';
    return '';
  };

  return (
    <div className="dashboard">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="text-title">Selamat Datang, {user.name}</h2>
        <p className="text-muted">{getRoleName()} • {user.location}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginBottom: '8px' }}>
            <Activity size={18} />
            <span className="font-medium text-xs">Total</span>
          </div>
          <p className="text-title" style={{ fontSize: '1.75rem' }}>
            {loading ? '—' : screenings.length}
          </p>
        </div>
        
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning)', marginBottom: '8px' }}>
            <Clock size={18} />
            <span className="font-medium text-xs">Pending</span>
          </div>
          <p className="text-title" style={{ fontSize: '1.75rem' }}>
            {loading ? '—' : pendingCount}
          </p>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', marginBottom: '8px' }}>
            <CheckCircle size={18} />
            <span className="font-medium text-xs">Reviewed</span>
          </div>
          <p className="text-title" style={{ fontSize: '1.75rem' }}>
            {loading ? '—' : approvedCount}
          </p>
        </div>
      </div>

      {user.role === 'worker' && (
        <button className="btn btn-primary" onClick={() => navigate('/screening')} style={{ marginBottom: '32px', padding: '16px' }}>
          <Activity size={20} />
          Start New Screening
        </button>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="font-bold text-lg">
            {user.role === 'doctor' ? 'Incoming Referrals' : 'Recent Screenings'}
          </h3>
          <button className="text-primary text-sm font-medium" onClick={() => navigate('/patients')} style={{ color: 'var(--primary)' }}>
            View All
          </button>
        </div>

        {loading && (
          <p className="text-muted" style={{ textAlign: 'center', padding: '16px' }}>Loading...</p>
        )}

        {!loading && recentScreenings.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: '16px' }}>No screenings found.</p>
        )}

        {recentScreenings.map((screening) => (
          <div key={screening.id} className="card" onClick={() => navigate('/patients')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="font-bold">{screening.patient?.name} ({screening.patient?.age}y)</p>
                <p className="text-sm text-muted">
                  {screening.ai_prediction} • {Math.round(screening.ai_confidence * 100)}% confidence
                </p>
                {user.role === 'doctor' && screening.worker && (
                  <p className="text-xs text-muted" style={{ marginTop: '2px' }}>
                    📍 {screening.worker.location}
                  </p>
                )}
              </div>
              <span className={`badge ${screening.doc_validation === 'pending' ? 'pending' : screening.doc_validation === 'approved' ? 'reviewed' : 'urgent'}`}>
                {screening.doc_validation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
