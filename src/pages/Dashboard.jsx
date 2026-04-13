import { Activity, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react';
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
    <div id="dashboard-page" className="animate-slide-up">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #094067 0%, #0e5a8f 50%, #3da9fc 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 20px',
        color: '#fffffe',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-30px', right: '-20px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(255, 255, 254, 0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', right: '40px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(61, 169, 252, 0.15)',
        }} />
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Welcome back,</p>
        <h2 style={{
          fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.02em',
          marginBottom: '4px', position: 'relative',
        }}>{user.name}</h2>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{getRoleName()} • {user.location}</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: loading ? '—' : screenings.length, icon: Activity, color: '#3da9fc', bg: 'rgba(61, 169, 252, 0.08)' },
          { label: 'Pending', value: loading ? '—' : pendingCount, icon: Clock, color: '#e0a42b', bg: 'rgba(224, 164, 43, 0.08)' },
          { label: 'Reviewed', value: loading ? '—' : approvedCount, icon: CheckCircle, color: '#1b9e5a', bg: 'rgba(27, 158, 90, 0.08)' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ marginBottom: 0, padding: '16px', textAlign: 'center' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: stat.bg, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
            }}>
              <stat.icon size={18} />
            </div>
            <p style={{
              fontSize: '1.6rem', fontWeight: '800', color: 'var(--headline)',
              lineHeight: 1, marginBottom: '4px',
            }}>{stat.value}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--paragraph)', fontWeight: '500' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Action */}
      {user.role === 'worker' && (
        <button
          id="start-screening-btn"
          className="btn btn-primary"
          onClick={() => navigate('/screening')}
          style={{ marginBottom: '28px', padding: '15px 20px', fontSize: '0.95rem' }}
        >
          <Activity size={20} />
          Start New Screening
        </button>
      )}

      {/* Recent Screenings */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--headline)' }}>
            {user.role === 'doctor' ? 'Incoming Referrals' : 'Recent Screenings'}
          </h3>
          <button
            id="view-all-screenings"
            onClick={() => navigate('/patients')}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              color: 'var(--highlight)', fontSize: '0.8rem', fontWeight: '600',
              cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit',
            }}
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--paragraph)' }}>
            Loading screenings...
          </div>
        )}

        {!loading && recentScreenings.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--paragraph)' }}>
            No screenings found.
          </div>
        )}

        {recentScreenings.map((screening) => (
          <div
            key={screening.id}
            className="card"
            onClick={() => navigate('/patients')}
            style={{
              cursor: 'pointer',
              borderLeft: `4px solid ${
                screening.doc_validation === 'pending' ? 'var(--warning)' :
                screening.doc_validation === 'approved' ? 'var(--success)' : 'var(--danger)'
              }`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: '700', color: 'var(--headline)', marginBottom: '4px' }}>
                  {screening.patient?.name} ({screening.patient?.age}y)
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--paragraph)' }}>
                  {screening.ai_prediction} • {Math.round(screening.ai_confidence * 100)}% confidence
                </p>
                {user.role === 'doctor' && screening.worker && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '2px' }}>
                    📍 {screening.worker.location}
                  </p>
                )}
              </div>
              <span className={`badge ${screening.doc_validation === 'pending' ? 'pending' : screening.doc_validation === 'approved' ? 'approved' : 'revised'}`}>
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
