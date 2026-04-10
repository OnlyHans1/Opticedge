import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Shield, User } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('worker');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', background: 'var(--primary)', color: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={48} />
          </div>
        </div>
        <h1 className="text-title" style={{ color: 'white', fontSize: '2.5rem' }}>OpticEdge</h1>
        <p style={{ opacity: 0.9 }}>AI-Assisted Eye Screening Platform</p>
      </div>

      <div className="card" style={{ color: 'var(--text-main)' }}>
        <h2 className="font-bold text-lg" style={{ marginBottom: '24px', textAlign: 'center' }}>Sign in to continue</h2>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => setRole('worker')}
            className={`btn ${role === 'worker' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <User size={18} /> Kader
          </button>
          <button 
            type="button"
            onClick={() => setRole('doctor')}
            className={`btn ${role === 'doctor' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <Shield size={18} /> Dokter
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === 'worker' ? 'e.g. kader_ahmad' : 'e.g. dr_ratna'}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
              {role === 'worker' 
                ? 'Demo: kader_ahmad / password123' 
                : 'Demo: dr_ratna / password123'}
            </p>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
