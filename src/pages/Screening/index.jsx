import { useState, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, SwitchCamera, Eye, RotateCcw, Check, ChevronLeft, Scan, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiCreatePatient } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import useCamera from '../../hooks/useCamera';

const Screening = () => {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState({ left: null, right: null });
  const [currentEye, setCurrentEye] = useState('left');
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: '', nik: '', wa_number: '', symptom: '', location: ''
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    videoRef,
    isActive,
    error: cameraError,
    permissionState,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  } = useCamera();

  const handleNext = () => {
    setStep(step + 1);
  };

  // Start camera when entering step 2
  useEffect(() => {
    if (step === 2 && !capturedPreview) {
      startCamera();
    }
    return () => {
      if (step !== 2) {
        stopCamera();
      }
    };
  }, [step, capturedPreview]);

  const handleCapture = () => {
    if (!isActive) return;
    setIsProcessing(true);

    // Brief processing animation
    setTimeout(() => {
      const photoData = capturePhoto();
      if (photoData) {
        setCapturedPreview(photoData);
        stopCamera();
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleAcceptPhoto = () => {
    setPhotos({ ...photos, [currentEye]: capturedPreview });
    setCapturedPreview(null);

    if (currentEye === 'left') {
      setCurrentEye('right');
      // Camera will restart via useEffect
    }
    // If right eye, just stay — user can submit or retake
  };

  const handleRetakePhoto = () => {
    setCapturedPreview(null);
    // Camera will restart via useEffect
  };

  const handleRetakeExisting = (eye) => {
    setPhotos({ ...photos, [eye]: null });
    setCurrentEye(eye);
    setCapturedPreview(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    stopCamera();
    setIsSubmitting(true);

    try {
      // 1. Create patient via API
      const patient = await apiCreatePatient({
        nik: formData.nik,
        name: formData.name,
        age: parseInt(formData.age, 10),
        wa_number: formData.wa_number,
      });

      // 2. Navigate to result page with patient + photos for AI analysis
      navigate('/screening/result', {
        state: {
          patient,
          photos,
          formData,
        }
      });
    } catch (error) {
      console.error('Failed to create patient:', error);
      alert(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // Camera permission denied screen
  const renderPermissionDenied = () => (
    <div className="camera-permission animate-fade-in">
      <div className="camera-permission-icon">
        <Camera size={48} />
      </div>
      <h3 className="font-bold text-lg" style={{ marginBottom: '8px' }}>📸 Camera Access Required</h3>
      <p className="text-muted text-sm" style={{ textAlign: 'center', marginBottom: '20px' }}>
        Please allow camera access in your browser to capture eye images for screening.
      </p>
      <button className="btn btn-primary" onClick={() => startCamera()}>
        <Camera size={18} />
        Grant Camera Access
      </button>
    </div>
  );

  // Camera error screen
  const renderCameraError = () => (
    <div className="camera-permission animate-fade-in">
      <div className="camera-permission-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
        <AlertCircle size={48} />
      </div>
      <h3 className="font-bold text-lg" style={{ marginBottom: '8px' }}>Camera Error</h3>
      <p className="text-muted text-sm" style={{ textAlign: 'center', marginBottom: '20px' }}>
        {cameraError}
      </p>
      <button className="btn btn-primary" onClick={() => startCamera()}>
        <RotateCcw size={18} />
        Try Again
      </button>
    </div>
  );

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
                <label className="form-label">NIK (ID Number)</label>
                <input type="text" name="nik" className="form-control" placeholder="e.g. 3201234567890001" value={formData.nik} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-control" placeholder="e.g. Siti Aminah" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" name="age" className="form-control" value={formData.age} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input type="tel" name="wa_number" className="form-control" placeholder="081234567890" value={formData.wa_number} onChange={handleInputChange} required />
                </div>
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
                <input type="text" name="location" className="form-control" placeholder="e.g. Desa Mekar" value={formData.location} onChange={handleInputChange} required />
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
            <h3 className="font-bold text-lg" style={{ marginBottom: '8px' }}>
              <Eye size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
              Image Capture
            </h3>
            <p className="text-muted text-sm" style={{ marginBottom: '20px' }}>
              Capture clear images of both eyes using the camera. Ensure good lighting.
            </p>

            {/* Camera Viewfinder or Preview */}
            {permissionState === 'denied' && !isActive ? (
              renderPermissionDenied()
            ) : cameraError && !isActive ? (
              renderCameraError()
            ) : capturedPreview ? (
              /* Photo Preview */
              <div className="animate-fade-in">
                <div className="camera-eye-label">
                  <Eye size={16} />
                  <span style={{ textTransform: 'capitalize' }}>{currentEye} Eye — Preview</span>
                </div>
                <div className="camera-container">
                  <img
                    src={capturedPreview}
                    alt={`${currentEye} eye capture`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="camera-controls" style={{ marginTop: '16px' }}>
                  <button className="camera-ctrl-btn" onClick={handleRetakePhoto}>
                    <RotateCcw size={20} />
                    <span className="text-xs">Retake</span>
                  </button>
                  <button className="capture-btn capture-btn--accept" onClick={handleAcceptPhoto}>
                    <Check size={32} />
                  </button>
                  <div style={{ width: '56px' }}></div>
                </div>
              </div>
            ) : (!photos[currentEye]) ? (
              /* Live Camera */
              <div className="animate-fade-in">
                <div className="camera-eye-label">
                  <Eye size={16} />
                  <span style={{ textTransform: 'capitalize' }}>{currentEye} Eye</span>
                </div>
                <div className="camera-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-viewfinder"
                  />

                  {/* Corner bracket guides */}
                  <div className="camera-guide">
                    <div className="camera-bracket camera-bracket--tl"></div>
                    <div className="camera-bracket camera-bracket--tr"></div>
                    <div className="camera-bracket camera-bracket--bl"></div>
                    <div className="camera-bracket camera-bracket--br"></div>
                  </div>

                  {/* Focus ring */}
                  {!isProcessing && (
                    <div className="camera-focus-ring">
                      <Eye size={24} color="rgba(255,255,255,0.8)" />
                    </div>
                  )}

                  {/* Processing overlay */}
                  {isProcessing && (
                    <div className="scanning-overlay">
                      <div className="scanning-content">
                        <div className="scanning-icon-wrapper">
                          <Scan size={36} />
                        </div>
                        <span className="font-medium text-sm">Capturing...</span>
                        <div className="scanning-dots">
                          <span className="scanning-dot"></span>
                          <span className="scanning-dot"></span>
                          <span className="scanning-dot"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="camera-controls">
                  <button className="camera-ctrl-btn" onClick={switchCamera}>
                    <SwitchCamera size={20} />
                    <span className="text-xs">Switch</span>
                  </button>

                  <button
                    className={`capture-btn ${isProcessing ? 'capture-btn--active' : ''}`}
                    onClick={handleCapture}
                    disabled={isProcessing || !isActive}
                  >
                    <Camera size={32} />
                  </button>

                  <div style={{ width: '56px' }}></div>
                </div>
              </div>
            ) : null}

            {/* Captured Photos Thumbnails */}
            {(photos.left || photos.right) && !capturedPreview && photos[currentEye] && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {['left', 'right'].map((eye) => (
                    <div key={eye} className="camera-thumbnail-card">
                      <p className="font-medium text-sm" style={{ marginBottom: '8px', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={14} />
                        {eye} Eye
                        {photos[eye] && <CheckCircle size={14} color="var(--success)" />}
                      </p>
                      {photos[eye] ? (
                        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '100px' }}>
                          <img src={photos[eye]} alt={`${eye} eye`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            className="camera-retake-badge"
                            onClick={() => handleRetakeExisting(eye)}
                          >
                            <RotateCcw size={12} />
                            Retake
                          </button>
                        </div>
                      ) : (
                        <div
                          className="camera-thumbnail-empty"
                          onClick={() => { setCurrentEye(eye); setCapturedPreview(null); }}
                        >
                          <Camera size={20} />
                          <span className="text-xs text-muted">Tap to capture</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="camera-tips">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Lightbulb size={16} color="var(--primary)" />
                <span className="font-medium text-sm">Capture Tips</span>
              </div>
              <ul className="camera-tips-list">
                <li>Ensure good, even lighting on the eye</li>
                <li>Keep the camera 10-15cm from the eye</li>
                <li>Ask the patient to look straight ahead</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={() => { stopCamera(); setStep(1); }} style={{ flex: 1 }}>
                <ChevronLeft size={18} />
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                style={{ flex: 2 }}
                disabled={!photos.left || !photos.right || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 removed — now handled by ScreeningResult page */}
    </div>
  );
};

export default Screening;
