import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { savePatient } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../utils/imageCompression';
import CameraCapture from '../components/CameraCapture';

const Screening = () => {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState({ left: null, right: null });
  const [activeCamera, setActiveCamera] = useState(null); // 'left' or 'right'
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', phone: '', symptom: '', location: ''
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNext = () => setStep(step + 1);
  
  const handlePhotoUpload = async (e, eye) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 800); // 800px max-width gives good balance
        setPhotos(prev => ({ ...prev, [eye]: compressedDataUrl }));
      } catch (error) {
        console.error("Failed to compress image:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    savePatient({
      ...formData,
      photos: { left: photos.left, right: photos.right },
      createdBy: user.id
    });
    setStep(3); // Show Success
  };

  return (
    <div className="screening-flow">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
        <h2 className="text-title">New Patient Screening</h2>
      </div>

      <div style={{ display: 'flex', marginBottom: '24px', position: 'relative' }}>
        <div style={{ flex: 1, height: '4px', background: 'var(--primary)', borderRadius: '4px' }}></div>
        <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--primary)' : 'var(--border)', borderRadius: '4px', marginLeft: '8px' }}></div>
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <div className="card">
            <h3 className="font-bold text-lg" style={{ marginBottom: '16px' }}>Patient Information</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-control" placeholder="e.g. Kamala Devi" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" name="age" className="form-control" value={formData.age} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-control" value={formData.gender} onChange={handleInputChange} required>
                    <option value="">Select</option>
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-control" placeholder="e.g. +91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Symptom</label>
                <select name="symptom" className="form-control" value={formData.symptom} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="blur">Blurry Vision</option>
                  <option value="pain">Eye Pain</option>
                  <option value="redness">Redness</option>
                  <option value="routine">Routine Check</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" name="location" className="form-control" defaultValue="Village Block A" value={formData.location} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Next Step
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="card">
            <h3 className="font-bold text-lg" style={{ marginBottom: '16px' }}>Image Capture</h3>
            <p className="text-muted text-sm" style={{ marginBottom: '24px' }}>
              Please capture clear images of both eyes using the smartphone camera. Ensure good lighting.
            </p>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              {['left', 'right'].map((eye) => (
                <div key={eye} style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center', background: photos[eye] ? 'transparent' : 'var(--bg-main)' }}>
                  <p className="font-medium" style={{ marginBottom: '12px', textTransform: 'capitalize' }}>{eye} Eye</p>
                  
                  {activeCamera === eye ? (
                    <CameraCapture 
                      eye={eye}
                      onCapture={(dataUrl) => {
                        setPhotos(prev => ({ ...prev, [eye]: dataUrl }));
                        setActiveCamera(null);
                      }}
                      onCancel={() => setActiveCamera(null)}
                    />
                  ) : photos[eye] ? (
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '180px' }}>
                      <img src={photos[eye]} alt={`${eye} eye`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => setPhotos({ ...photos, [eye]: null })}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        Retake
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => setActiveCamera(eye)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px' }}
                      >
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Camera size={24} />
                        </div>
                        <span className="text-sm font-medium">Open Camera</span>
                      </button>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        <span className="text-xs text-muted">OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                      </div>

                      <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                        <span className="text-sm font-medium text-primary">Upload existing photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handlePhotoUpload(e, eye)} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit} 
                style={{ flex: 2 }}
                disabled={!photos.left || !photos.right}
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={32} />
          </div>
          <h3 className="font-bold text-title" style={{ marginBottom: '8px' }}>Screening Complete</h3>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            Patient data and images have been successfully uploaded and are pending remote specialist review.
          </p>
          <div style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '24px', textAlign: 'left' }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span className="text-sm">Expect a diagnosis within 2-4 hours. You will be notified.</span>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Screening;
