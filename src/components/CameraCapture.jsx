import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';
import { compressImage } from '../utils/imageCompression';

const CameraCapture = ({ onCapture, onCancel, eye }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not available. Ensure HTTPS is used or testing on localhost.");
      }

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
      } catch (err) {
        console.warn("Failed to get environment camera, falling back:", err);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(mediaStream);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access the camera: " + err.message);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    if (!videoRef.current || !isReady) return;
    
    setIsCapturing(true);
    try {
      const video = videoRef.current;
      if (!video.videoWidth || !video.videoHeight) {
        throw new Error("Video stream dimensions are 0");
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const file = new File([blob], `capture_${eye}.jpg`, { type: 'image/jpeg' });
            const compressedDataUrl = await compressImage(file, 800);
            stopCamera();
            onCapture(compressedDataUrl);
          } catch (e) {
            console.error("Compression failed:", e);
            setError("Failed to process image.");
            setIsCapturing(false);
          }
        } else {
          setError("Failed to create image blob.");
          setIsCapturing(false);
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
          <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 12px' }} onClick={() => { setError(null); startCamera(); }}>
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
        muted 
        onLoadedMetadata={() => {
          setIsReady(true);
          if (videoRef.current) {
            videoRef.current.play().catch(e => console.error("Play error:", e));
          }
        }}
        style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
      />
      
      {!isReady && !error && stream && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 5 }}>
          Loading camera...
        </div>
      )}
      
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px', zIndex: 10 }}>
        <button 
          onClick={handleCancel}
          style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>
      
      <div style={{ position: 'absolute', bottom: '16px', left: '0', right: '0', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <button 
          onClick={handleCapture}
          disabled={isCapturing || !isReady}
          style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            background: 'rgba(255,255,255,0.3)', border: '4px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isCapturing || !isReady ? 'not-allowed' : 'pointer',
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
