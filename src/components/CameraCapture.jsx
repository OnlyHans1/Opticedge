import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';
import { compressImage } from '../utils/imageCompression';

const CameraCapture = ({ onCapture, onCancel, eye }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer rear camera if available
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access the camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    
    setIsCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob to pass to our existing compressImage utility
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `capture_${eye}.jpg`, { type: 'image/jpeg' });
          const compressedDataUrl = await compressImage(file, 800);
          stopCamera();
          onCapture(compressedDataUrl);
        }
      }, 'image/jpeg', 0.9);
      
    } catch (err) {
      console.error("Capture failed:", err);
      setError("Failed to capture image.");
      setIsCapturing(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  if (error) {
    return (
      <div style={{ padding: '16px', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
        <p className="text-sm text-danger" style={{ color: 'var(--danger)', marginBottom: '12px' }}>{error}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button className="btn btn-outline" style={{ width: 'auto', padding: '6px 12px' }} onClick={handleCancel}>Cancel</button>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 12px' }} onClick={startCamera}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#000' }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
      />
      
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleCancel}
          style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>
      
      <div style={{ position: 'absolute', bottom: '16px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={handleCapture}
          disabled={isCapturing || !stream}
          style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            background: 'rgba(255,255,255,0.3)', border: '4px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isCapturing || !stream ? 'not-allowed' : 'pointer',
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white' }}></div>
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
