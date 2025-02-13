'use client';

import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraProps {
  onCapture: (imageSrc: string | null) => void;
}

export default function Camera({ onCapture }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot() ?? null;
    onCapture(imageSrc);
  }, [onCapture]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full max-w-lg mx-auto rounded-lg shadow-lg"
        videoConstraints={{
          facingMode: "environment"
        }}
      />
      <button 
        onClick={capture}
        className="px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
      >
        Take Photo
      </button>
    </div>
  );
} 