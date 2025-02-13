'use client';

import { useState } from 'react';
import Camera from '@/components/Camera';

interface AnalysisResult {
  isHotdog: boolean;
  reason: string;
  rawResponse: string;
  timestamp: number;
  image: string;
}

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (imageSrc: string | null) => {
    if (!imageSrc) {
      setError('Failed to capture image');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      const newResult = {
        ...data,
        timestamp: Date.now(),
        image: imageSrc
      };
      
      setResult(newResult);
      setHistory(prev => [newResult, ...prev]);
    } catch (err) {
      setError('Failed to analyze image');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-center mb-8">
              🌭 Hotdog Detector
            </h1>

            <Camera onCapture={handleCapture} />
            
            {analyzing && (
              <div className="text-center text-lg animate-pulse">
                Analyzing image... 🔍
              </div>
            )}

            {result && !analyzing && (
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-lg space-y-4">
                <div className="text-2xl font-bold text-center">
                  {result.isHotdog ? (
                    <span className="text-green-500">✅ It's a hotdog! 🌭</span>
                  ) : (
                    <span className="text-red-500">❌ Not a hotdog</span>
                  )}
                </div>
                
                <div className="text-lg">
                  <h3 className="font-semibold mb-2">Reasoning:</h3>
                  <p className="text-gray-700">{result.reason}</p>
                </div>

                <div className="text-sm">
                  <h3 className="font-semibold mb-2">Raw Analysis:</h3>
                  <pre className="whitespace-pre-wrap text-gray-600 bg-gray-50 p-3 rounded">
                    {result.rawResponse}
                  </pre>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-red-500">
                {error}
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">History</h2>
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {history.map((item, index) => (
                <div 
                  key={item.timestamp} 
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video relative mb-3">
                    <img 
                      src={item.image} 
                      alt={`Analysis ${index + 1}`}
                      className="rounded object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-lg font-semibold mb-2">
                    {item.isHotdog ? (
                      <span className="text-green-500">✅ Hotdog</span>
                    ) : (
                      <span className="text-red-500">❌ Not a hotdog</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.reason}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="text-center text-gray-500">
                  No history yet. Take some photos!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
