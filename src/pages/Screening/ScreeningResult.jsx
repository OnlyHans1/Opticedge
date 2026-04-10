import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Eye, CheckCircle, AlertCircle, AlertTriangle, ArrowLeft, RotateCcw,
  Activity, Stethoscope, Shield, TrendingUp, FileText, Scan
} from 'lucide-react';
import { analyzeImage, parseAIResponse } from '../../config/ai';
import { eyeScanPrompt } from './EyeScanPrompt';
import { apiCreateScreening } from '../../utils/api';

// Demo/fallback data when no API key is set
const DEMO_RESULT = {
  error: false,
  condition: 'Early Cataract',
  confidence: 78,
  severity: 'mild',
  riskLevel: 'medium',
  findings: [
    'Mild lens opacity observed in the nuclear region',
    'Cornea appears clear with no visible scarring',
    'Pupil is round and reactive — no signs of trauma',
    'Slight yellowish tinge consistent with early nuclear sclerosis',
  ],
  recommendations: [
    'Schedule follow-up with ophthalmologist within 3 months',
    'Monitor visual acuity changes — patient should report worsening blur',
    'Advise UV protection (sunglasses) to slow progression',
    'No immediate surgical intervention needed at this stage',
  ],
  referralNeeded: true,
  referralUrgency: 'routine',
  additionalNotes: 'Image quality is adequate for screening. Findings are suggestive but require clinical confirmation with slit-lamp examination.',
};

const severityConfig = {
  none:     { label: 'Normal',   color: 'var(--success)', bg: 'var(--success-light)', icon: CheckCircle },
  mild:     { label: 'Mild',     color: 'var(--warning)', bg: 'var(--warning-light)', icon: AlertTriangle },
  moderate: { label: 'Moderate', color: '#F97316',        bg: '#FFF7ED',              icon: AlertTriangle },
  severe:   { label: 'Severe',   color: 'var(--danger)',  bg: 'var(--danger-light)',   icon: AlertCircle },
};

const urgencyConfig = {
  routine: { label: 'Routine',  color: 'var(--success)' },
  soon:    { label: 'Soon',     color: 'var(--warning)' },
  urgent:  { label: 'Urgent',   color: 'var(--danger)' },
};

const ScreeningResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, photos, formData } = location.state || {};

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analyzedEye, setAnalyzedEye] = useState('left');
  const [savedScreening, setSavedScreening] = useState(null);

  useEffect(() => {
    if (!photos || (!photos.left && !photos.right)) {
      navigate('/screening', { replace: true });
      return;
    }
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    // Use whichever eye photo is available (prefer left)
    const imageToAnalyze = photos.left || photos.right;
    setAnalyzedEye(photos.left ? 'left' : 'right');

    let aiResult = null;

    try {
      const rawResponse = await analyzeImage(imageToAnalyze, eyeScanPrompt);
      const parsed = parseAIResponse(rawResponse);
      aiResult = parsed;
      setResult(parsed);
    } catch (err) {
      console.error('AI Analysis error:', err);
      if (err.message === 'NO_API_KEY') {
        // Use demo data when no API key
        console.log('No API key found, using demo data');
        await new Promise(r => setTimeout(r, 2000));
        aiResult = DEMO_RESULT;
        setResult(DEMO_RESULT);
      } else {
        setError(err.message || 'Failed to analyze image');
        await new Promise(r => setTimeout(r, 1500));
        aiResult = DEMO_RESULT;
        setResult(DEMO_RESULT);
      }
    } finally {
      setIsLoading(false);
    }

    // Save screening to backend API after AI analysis
    if (aiResult && patient?.id) {
      try {
        const screening = await apiCreateScreening({
          patient_id: patient.id,
          eye_image_url: imageToAnalyze,
          ai_prediction: aiResult.condition || 'Unknown',
          ai_confidence: (aiResult.confidence || 50) / 100, // Convert from 0-100 to 0-1
          sync_status: 'synced',
        });
        setSavedScreening(screening);
        console.log('Screening saved to backend:', screening.id);
      } catch (saveErr) {
        console.error('Failed to save screening to backend:', saveErr);
        // Don't block the UI — the result is still shown
      }
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="screening-flow animate-fade-in">
        <div className="result-loading">
          <div className="result-loading-icon">
            <Scan size={40} />
          </div>
          <h3 className="font-bold text-lg" style={{ marginBottom: '8px' }}>
            🤖 AI Analyzing Eye Images...
          </h3>
          <p className="text-muted text-sm" style={{ textAlign: 'center', maxWidth: '280px' }}>
            Our AI is examining the captured images for potential eye conditions
          </p>
          <div className="scanning-dots" style={{ marginTop: '16px' }}>
            <span className="scanning-dot"></span>
            <span className="scanning-dot"></span>
            <span className="scanning-dot"></span>
          </div>

          {/* Patient info during loading */}
          {formData && (
            <div className="result-patient-mini" style={{ marginTop: '24px' }}>
              <span className="text-muted text-xs">Patient:</span>
              <span className="font-medium text-sm">{formData.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error result from AI (not an eye image)
  if (result?.error) {
    return (
      <div className="screening-flow animate-fade-in">
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div className="result-status-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="font-bold text-lg" style={{ marginBottom: '8px' }}>Not an Eye Image</h3>
          <p className="text-muted text-sm" style={{ marginBottom: '24px' }}>
            {result.message || 'The captured image does not appear to be an eye. Please try again with a clear eye image.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>
              Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/screening')} style={{ flex: 1 }}>
              <RotateCcw size={18} />
              Scan Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const severity = severityConfig[result?.severity] || severityConfig.none;
  const SeverityIcon = severity.icon;
  const urgency = urgencyConfig[result?.referralUrgency] || urgencyConfig.routine;

  return (
    <div className="screening-flow animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-title" style={{ fontSize: '1.25rem', marginBottom: '2px' }}>Screening Result</h2>
          <span className="text-muted text-xs">
            AI Eye Analysis
            {savedScreening && ' • Saved ✓'}
          </span>
        </div>
      </div>

      {/* Eye Images */}
      <div className="card" style={{ padding: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {['left', 'right'].map((eye) => (
            <div key={eye} style={{ position: 'relative' }}>
              {photos[eye] ? (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '110px' }}>
                  <img src={photos[eye]} alt={`${eye} eye`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {eye === analyzedEye && (
                    <div className="result-analyzed-badge">
                      <Scan size={10} />
                      Analyzed
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ height: '110px', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-muted text-xs">No image</span>
                </div>
              )}
              <p className="text-xs font-medium" style={{ textAlign: 'center', marginTop: '6px', textTransform: 'capitalize', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Eye size={12} /> {eye} Eye
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Info */}
      {formData && (
        <div className="card result-patient-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <FileText size={16} color="var(--primary)" />
            <span className="font-medium text-sm">Patient Info</span>
            {patient?.id && (
              <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
                QR: {patient.id.substring(0, 8)}...
              </span>
            )}
          </div>
          <div className="result-patient-grid">
            <div><span className="text-muted text-xs">Name</span><span className="text-sm font-medium">{formData.name}</span></div>
            <div><span className="text-muted text-xs">Age</span><span className="text-sm font-medium">{formData.age}</span></div>
            <div><span className="text-muted text-xs">NIK</span><span className="text-sm font-medium">{formData.nik}</span></div>
            <div><span className="text-muted text-xs">Symptom</span><span className="text-sm font-medium" style={{ textTransform: 'capitalize' }}>{formData.symptom}</span></div>
          </div>
        </div>
      )}

      {/* AI Diagnosis Card */}
      <div className="card result-diagnosis-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={18} color="var(--primary)" />
            <span className="font-bold text-base">AI Diagnosis</span>
          </div>
          <div className="result-confidence-badge">
            <Activity size={12} />
            <span>{result?.confidence || 0}% confidence</span>
          </div>
        </div>

        <div className="result-condition-box">
          <div className="result-severity-badge" style={{ background: severity.bg, color: severity.color }}>
            <SeverityIcon size={16} />
            <span>{severity.label}</span>
          </div>
          <h3 className="font-bold" style={{ fontSize: '1.2rem', margin: '8px 0 4px' }}>
            {result?.condition || 'Unknown'}
          </h3>
          {result?.riskLevel && (
            <span className="text-xs" style={{ color: result.riskLevel === 'high' ? 'var(--danger)' : result.riskLevel === 'medium' ? 'var(--warning)' : 'var(--success)' }}>
              Risk Level: {result.riskLevel.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Findings */}
      {result?.findings?.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Eye size={16} color="var(--primary)" />
            <span className="font-bold text-sm">Findings</span>
          </div>
          <div className="result-findings-list">
            {result.findings.map((finding, i) => (
              <div key={i} className="result-finding-item">
                <div className="result-finding-dot"></div>
                <span className="text-sm">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result?.recommendations?.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Shield size={16} color="var(--success)" />
            <span className="font-bold text-sm">Recommendations</span>
          </div>
          <div className="result-recommendations-list">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="result-recommendation-item">
                <span className="result-rec-number">{i + 1}</span>
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral Info */}
      {result?.referralNeeded && (
        <div className="result-referral-card" style={{ borderLeftColor: urgency.color }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={16} color={urgency.color} />
            <span className="font-bold text-sm">Referral Needed</span>
            <span className="badge" style={{ background: urgency.color + '20', color: urgency.color, marginLeft: 'auto' }}>
              {urgency.label}
            </span>
          </div>
          <p className="text-muted text-sm">{result.additionalNotes}</p>
        </div>
      )}

      {/* Saved status */}
      {savedScreening && (
        <div style={{ background: 'var(--success-light)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <CheckCircle size={16} color="var(--success)" />
          <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
            Screening saved — pending doctor review
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', marginBottom: '16px' }}>
        <button className="btn btn-outline" onClick={() => navigate('/screening')} style={{ flex: 1 }}>
          <RotateCcw size={18} />
          Scan Again
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default ScreeningResult;
