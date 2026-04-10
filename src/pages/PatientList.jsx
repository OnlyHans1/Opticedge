import { useState, useEffect } from 'react';
import { Search, Phone, MapPin, FileText, Eye, CheckCircle, Clock, Edit2 } from 'lucide-react';
import { apiGetScreenings, apiValidateScreening } from '../utils/api';
import { useAuth } from '../context/AuthContext';

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

  // Detail view
  if (selectedScreening) {
    const s = selectedScreening;
    return (
      <div className="animate-fade-in pb-20">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={() => { setSelectedScreening(null); setIsValidating(false); }}
            className="text-primary font-medium"
            style={{ color: 'var(--primary)' }}
          >
            ← Back to List
          </button>
          {user.role === 'doctor' && s.doc_validation === 'pending' && !isValidating && (
            <button 
              onClick={() => setIsValidating(true)}
              className="btn btn-primary" 
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              <Edit2 size={16} /> Validate
            </button>
          )}
        </div>

        {/* Patient Info */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 className="text-title">{s.patient?.name}</h2>
              <p className="text-muted">{s.patient?.age} years old • NIK: {s.patient?.nik}</p>
            </div>
            <span className={`badge ${s.doc_validation === 'pending' ? 'pending' : s.doc_validation === 'approved' ? 'reviewed' : 'urgent'}`}>
              {s.doc_validation}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <div className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.875rem', flex: 1, cursor: 'default' }}>
              <Phone size={16} /> {s.patient?.wa_number || 'N/A'}
            </div>
            {s.worker && (
              <div className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.875rem', flex: 1, cursor: 'default' }}>
                <MapPin size={16} /> {s.worker?.location || 'N/A'}
              </div>
            )}
          </div>

          {/* AI Analysis */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="font-bold border-b pb-2 mb-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '12px' }}>
              🤖 AI Analysis
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '0.875rem' }}>
              <span className="text-muted">Prediction:</span>
              <span className="font-medium">{s.ai_prediction}</span>
              
              <span className="text-muted">Confidence:</span>
              <span className="font-medium">
                <span style={{ 
                  color: s.ai_confidence >= 0.8 ? 'var(--danger)' : s.ai_confidence >= 0.6 ? 'var(--warning)' : 'var(--success)',
                  fontWeight: '600'
                }}>
                  {Math.round(s.ai_confidence * 100)}%
                </span>
              </span>

              <span className="text-muted">Date:</span>
              <span className="font-medium">{new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>

              <span className="text-muted">Worker:</span>
              <span className="font-medium">{s.worker?.name || 'N/A'}</span>

              {s.doctor && (
                <>
                  <span className="text-muted">Doctor:</span>
                  <span className="font-medium">{s.doctor?.name}</span>
                </>
              )}

              {s.reviewed_at && (
                <>
                  <span className="text-muted">Reviewed:</span>
                  <span className="font-medium">{new Date(s.reviewed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </>
              )}
            </div>
          </div>

          {/* Eye Image */}
          {s.eye_image_url && s.eye_image_url.startsWith('data:') && (
            <div style={{ marginBottom: '24px' }}>
              <h3 className="font-bold border-b pb-2 mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Eye Image</h3>
              <div 
                style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'zoom-in', height: '200px', border: '1px solid var(--border)' }}
                onClick={() => setZoomedImage(s.eye_image_url)}
              >
                <img src={s.eye_image_url} alt="Eye scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          {/* Doctor Notes */}
          {s.doctor_notes && (
            <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', color: 'var(--primary-dark)', marginBottom: '8px', fontWeight: '600' }}>
                <FileText size={20} />
                <span>Doctor's Notes</span>
              </div>
              <p className="text-sm">{s.doctor_notes}</p>
            </div>
          )}

          {/* Pending Review Notice */}
          {s.doc_validation === 'pending' && user.role !== 'doctor' && (
            <div style={{ background: 'var(--warning-light)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
                A specialist is currently reviewing the images. Please wait for the final diagnosis.
              </p>
            </div>
          )}

          {/* Doctor Validation Form */}
          {isValidating && (
            <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h4 className="font-bold mb-3">Validate Screening</h4>
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
                <div style={{ display: 'flex', gap: '8px' }}>
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
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', padding: '16px' }}
            onClick={() => setZoomedImage(null)}
          >
            <img src={zoomedImage} alt="Zoomed Eye" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
            <button 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
              onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="patient-list">
      <h2 className="text-title" style={{ marginBottom: '16px' }}>
        {user.role === 'doctor' ? 'Screening Reviews' : 'My Screenings'}
      </h2>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search patient or prediction..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <select 
          className="form-control" 
          style={{ width: 'auto' }}
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
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
          Loading screenings...
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredScreenings.map((screening) => (
          <div 
            key={screening.id} 
            className="card" 
            style={{ marginBottom: 0, cursor: 'pointer' }} 
            onClick={() => setSelectedScreening(screening)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p className="font-bold text-lg">{screening.patient?.name}</p>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span>{screening.patient?.age}y</span>
                  <span>•</span>
                  <span>{screening.ai_prediction}</span>
                  <span>•</span>
                  <span style={{ 
                    fontWeight: '600',
                    color: screening.ai_confidence >= 0.8 ? 'var(--danger)' : screening.ai_confidence >= 0.6 ? 'var(--warning)' : 'var(--success)' 
                  }}>
                    {Math.round(screening.ai_confidence * 100)}%
                  </span>
                </div>
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
        {!loading && filteredScreenings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            No screenings found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
