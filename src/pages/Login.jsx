import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, Lock, User, Loader2, ChevronDown } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
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
    <div id="login-page" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #094067 0%, #0e5a8f 40%, #3da9fc 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background circles */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-60px',
        width: '220px', height: '220px', borderRadius: '50%',
        background: 'rgba(61, 169, 252, 0.15)', filter: 'blur(2px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-60px',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'rgba(144, 180, 206, 0.1)', filter: 'blur(2px)',
      }} />

      {/* Logo & Branding */}
      <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: '20px',
        }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '24px',
            background: 'rgba(255, 255, 254, 0.15)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.2)',
          }}>
            <Eye size={44} strokeWidth={1.5} />
          </div>
        </div>
        <h1 style={{
          fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.03em',
          marginBottom: '8px',
        }}>OpticEdge</h1>
        <p style={{ opacity: 0.8, fontSize: '0.95rem', fontWeight: '400' }}>
          AI-Assisted Eye Screening Platform
        </p>
      </div>

      {/* Login Card */}
      <div style={{
        background: 'rgba(255, 255, 254, 0.95)', backdropFilter: 'blur(20px)',
        borderRadius: '20px', padding: '28px 24px',
        boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.25)',
        color: 'var(--headline)', position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontWeight: '700', fontSize: '1.15rem', marginBottom: '24px',
          textAlign: 'center', color: '#094067',
        }}>Sign in to continue</h2>

        {error && (
          <div id="login-error" style={{
            padding: '12px 16px', background: '#fee2e2', color: '#ef4565',
            borderRadius: '10px', marginBottom: '18px', fontSize: '0.85rem',
            fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '1.1rem' }}>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: '600',
              marginBottom: '8px', color: '#094067', letterSpacing: '0.02em',
            }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#90b4ce',
              }} />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%', padding: '12px 14px 12px 44px',
                  border: '1.5px solid rgba(144, 180, 206, 0.4)',
                  borderRadius: '12px', fontSize: '0.9rem',
                  fontFamily: 'inherit', color: '#094067',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  outline: 'none', background: '#fffffe',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3da9fc';
                  e.target.style.boxShadow = '0 0 0 3px rgba(61, 169, 252, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(144, 180, 206, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: '600',
              marginBottom: '8px', color: '#094067', letterSpacing: '0.02em',
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#90b4ce',
              }} />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 14px 12px 44px',
                  border: '1.5px solid rgba(144, 180, 206, 0.4)',
                  borderRadius: '12px', fontSize: '0.9rem',
                  fontFamily: 'inherit', color: '#094067',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  outline: 'none', background: '#fffffe',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3da9fc';
                  e.target.style.boxShadow = '0 0 0 3px rgba(61, 169, 252, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(144, 180, 206, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '13px', border: 'none',
              borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700',
              fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer',
              background: isLoading ? '#90b4ce' : '#3da9fc', color: '#fffffe',
              boxShadow: '0 4px 14px -3px rgba(61, 169, 252, 0.5)',
              transition: 'all 0.2s', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Toggle */}
        <div style={{ marginTop: '20px' }}>
          <button
            id="toggle-demo-credentials"
            onClick={() => setShowCredentials(!showCredentials)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px', padding: '8px',
              fontSize: '0.78rem', color: '#90b4ce', fontWeight: '500',
              fontFamily: 'inherit', cursor: 'pointer', background: 'none', border: 'none',
            }}
          >
            Demo Credentials
            <ChevronDown size={14} style={{
              transform: showCredentials ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }} />
          </button>
          {showCredentials && (
            <div style={{
              marginTop: '8px', padding: '14px', borderRadius: '10px',
              background: 'rgba(61, 169, 252, 0.06)',
              border: '1px solid rgba(61, 169, 252, 0.1)',
              fontSize: '0.78rem', color: '#5f6c7b',
              animation: 'fadeIn 0.2s ease-out',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#094067', display: 'block', marginBottom: '2px' }}>Worker</span>
                  <span>kader_ahmad / password123</span>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#094067', display: 'block', marginBottom: '2px' }}>Doctor</span>
                  <span>dr_ratna / password123</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
