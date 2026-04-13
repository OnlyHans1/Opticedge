import { useState, useEffect } from 'react';
import { Search, Phone, MapPin, FileText, Eye, CheckCircle, Clock, Edit2 } from 'lucide-react';
import { apiGetScreenings, apiValidateScreening } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const PatientList = () => {
  const [screenings, setScreenings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationForm, setValidationForm] = useState({ doc_validation: 'approved', doctor_notes: '' });
  const [zoomedImage, setZoomedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  const loadScreenings = async () => {
    try {
      setLoading(true);
      const data = await apiGetScreenings();
      setScreenings(data);
    } catch (error) {
      console.error('Failed to load screenings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScreenings();
  }, [user]);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!selectedScreening) return;

    try {
      const updated = await apiValidateScreening(selectedScreening.id, validationForm);
      // Update local state
      setScreenings(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
      setSelectedScreening({ ...selectedScreening, ...updated });
      setIsValidating(false);
    } catch (error) {
      console.error('Failed to validate:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredScreenings = screenings.filter(s => {
    const matchesFilter = filter === 'all' || s.doc_validation === filter;
    const matchesSearch = 
      s.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ai_prediction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /**
   * Resolve eye image URL — handles both server-hosted uploads and base64 data URIs.
   */
  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    // Relative path from server (e.g. /uploads/eyes/...)
    return `${API_BASE_URL}${url}`;
  };

  // ─── Detail View ────────────────────────────────────────────
  if (selectedScreening) {
    const s = selectedScreening;
    const imageUrl = resolveImageUrl(s.eye_image_url);

    return (
      <div id="screening-detail" className="animate-fade-in" style={{ paddingBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={() => { setSelectedScreening(null); setIsValidating(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--highlight)', fontWeight: '600', fontSize: '0.9rem',
              cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit',
            }}
          >
            ← Back to List
          </button>
          {user.role === 'doctor' && s.doc_validation === 'pending' && !isValidating && (
            <button 
              onClick={() => setIsValidating(true)}
              className="btn btn-primary" 
              style={{ width: 'auto', padding: '8px 18px' }}
            >
              <Edit2 size={16} /> Validate
            </button>
          )}
        </div>

        {/* Patient Info */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 className="text-title" style={{ fontSize: '1.3rem' }}>{s.patient?.name}</h2>
              <p style={{ color: 'var(--paragraph)', fontSize: '0.85rem' }}>
                {s.patient?.age} years old • NIK: {s.patient?.nik}
              </p>
            </div>
            <span className={`badge ${s.doc_validation === 'pending' ? 'pending' : s.doc_validation === 'approved' ? 'approved' : 'revised'}`}>
              {s.doc_validation}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <div className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1, cursor: 'default' }}>
              <Phone size={14} /> {s.patient?.wa_number || 'N/A'}
            </div>
            {s.worker && (
              <div className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1, cursor: 'default' }}>
                <MapPin size={14} /> {s.worker?.location || 'N/A'}
              </div>
            )}
          </div>

          {/* AI Analysis */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontWeight: '700', fontSize: '0.95rem', color: 'var(--headline)',
              borderBottom: '1px solid rgba(144, 180, 206, 0.2)',
              paddingBottom: '10px', marginBottom: '14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '1.1rem' }}>🤖</span> AI Analysis
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--paragraph)' }}>Prediction:</span>
              <span style={{ fontWeight: '600', color: 'var(--headline)' }}>{s.ai_prediction}</span>
              
              <span style={{ color: 'var(--paragraph)' }}>Confidence:</span>
              <span style={{ 
                fontWeight: '700',
                color: s.ai_confidence >= 0.8 ? 'var(--danger)' : s.ai_confidence >= 0.6 ? 'var(--warning)' : 'var(--success)',
              }}>
                {Math.round(s.ai_confidence * 100)}%
              </span>

              <span style={{ color: 'var(--paragraph)' }}>Date:</span>
              <span style={{ fontWeight: '500', color: 'var(--headline)' }}>
                {new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>

              <span style={{ color: 'var(--paragraph)' }}>Worker:</span>
              <span style={{ fontWeight: '500', color: 'var(--headline)' }}>{s.worker?.name || 'N/A'}</span>

              {s.doctor && (
                <>
                  <span style={{ color: 'var(--paragraph)' }}>Doctor:</span>
                  <span style={{ fontWeight: '500', color: 'var(--headline)' }}>{s.doctor?.name}</span>
                </>
              )}

              {s.reviewed_at && (
                <>
                  <span style={{ color: 'var(--paragraph)' }}>Reviewed:</span>
                  <span style={{ fontWeight: '500', color: 'var(--headline)' }}>
                    {new Date(s.reviewed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Eye Image */}
          {imageUrl && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontWeight: '700', fontSize: '0.95rem', color: 'var(--headline)',
                borderBottom: '1px solid rgba(144, 180, 206, 0.2)',
                paddingBottom: '10px', marginBottom: '14px',
              }}>Eye Image</h3>
              <div 
                style={{
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  cursor: 'zoom-in', height: '200px',
                  border: '1px solid rgba(144, 180, 206, 0.2)',
                }}
                onClick={() => setZoomedImage(imageUrl)}
              >
                <img src={imageUrl} alt="Eye scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          {/* Doctor Notes */}
          {s.doctor_notes && (
            <div style={{
              background: 'rgba(61, 169, 252, 0.06)', padding: '16px',
              borderRadius: 'var(--radius-md)', marginBottom: '16px',
              border: '1px solid rgba(61, 169, 252, 0.1)',
            }}>
              <div style={{ display: 'flex', gap: '8px', color: 'var(--headline)', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem' }}>
                <FileText size={18} />
                <span>Doctor's Notes</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--paragraph)', lineHeight: '1.6' }}>{s.doctor_notes}</p>
            </div>
          )}

          {/* Pending Review Notice */}
          {s.doc_validation === 'pending' && user.role !== 'doctor' && (
            <div style={{
              background: 'var(--warning-light)', padding: '16px',
              borderRadius: 'var(--radius-md)', textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--warning)' }}>
                A specialist is currently reviewing the images. Please wait for the final diagnosis.
              </p>
            </div>
          )}

          {/* Doctor Validation Form */}
          {isValidating && (
            <div style={{
              background: 'rgba(61, 169, 252, 0.04)', padding: '20px',
              borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(61, 169, 252, 0.15)',
            }}>
              <h4 style={{ fontWeight: '700', marginBottom: '16px', color: 'var(--headline)' }}>Validate Screening</h4>
              <form onSubmit={handleValidate}>
                <div className="form-group">
                  <label className="form-label">Decision</label>
                  <select 
                    className="form-control" 
                    value={validationForm.doc_validation} 
                    onChange={e => setValidationForm({...validationForm, doc_validation: e.target.value})}
                  >
                    <option value="approved">✅ Approve AI Diagnosis</option>
                    <option value="revised">✏️ Revise Diagnosis</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Medical Notes</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={validationForm.doctor_notes} 
                    onChange={e => setValidationForm({...validationForm, doctor_notes: e.target.value})}
                    placeholder="Add clinical notes, revised diagnosis, or referral instructions..."
                    style={{ resize: 'vertical', minHeight: '80px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsValidating(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Review</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Zoom Modal */}
        {zoomedImage && (
          <div 
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(9, 64, 103, 0.9)', padding: '16px',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setZoomedImage(null)}
          >
            <img src={zoomedImage} alt="Zoomed Eye" style={{
              maxWidth: '100%', maxHeight: '90vh',
              borderRadius: 'var(--radius-lg)', objectFit: 'contain',
            }} />
            <button 
              style={{
                position: 'absolute', top: '24px', right: '24px',
                background: 'var(--bg-card)', color: 'var(--headline)',
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', border: 'none', cursor: 'pointer',
                boxShadow: 'var(--shadow-md)', fontSize: '1.1rem',
              }}
              onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── List View ──────────────────────────────────────────────
  return (
    <div id="patient-list-page" className="animate-slide-up">
      <h2 className="text-title" style={{ marginBottom: '18px' }}>
        {user.role === 'doctor' ? 'Screening Reviews' : 'My Screenings'}
      </h2>
      
      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--secondary)',
          }} />
          <input 
            id="search-screenings"
            type="text" 
            className="form-control" 
            placeholder="Search patient or prediction..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select 
          id="filter-screenings"
          className="form-control" 
          style={{ width: 'auto', minWidth: '95px' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="revised">Revised</option>
        </select>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--paragraph)' }}>
          Loading screenings...
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredScreenings.map((screening) => (
          <div 
            key={screening.id} 
            className="card" 
            style={{
              marginBottom: 0, cursor: 'pointer',
              borderLeft: `4px solid ${
                screening.doc_validation === 'pending' ? 'var(--warning)' :
                screening.doc_validation === 'approved' ? 'var(--success)' : 'var(--danger)'
              }`,
              transition: 'transform 0.15s, box-shadow 0.2s',
            }}
            onClick={() => setSelectedScreening(screening)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--headline)', marginBottom: '4px' }}>
                  {screening.patient?.name}
                </p>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--paragraph)', flexWrap: 'wrap' }}>
                  <span>{screening.patient?.age}y</span>
                  <span>•</span>
                  <span>{screening.ai_prediction}</span>
                  <span>•</span>
                  <span style={{ 
                    fontWeight: '700',
                    color: screening.ai_confidence >= 0.8 ? 'var(--danger)' : screening.ai_confidence >= 0.6 ? 'var(--warning)' : 'var(--success)',
                  }}>
                    {Math.round(screening.ai_confidence * 100)}%
                  </span>
                </div>
                {user.role === 'doctor' && screening.worker && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '4px' }}>
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
        {!loading && filteredScreenings.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--paragraph)' }}>
            No screenings found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
