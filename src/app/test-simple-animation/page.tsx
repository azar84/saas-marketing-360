'use client';

import React from 'react';

export default function TestSimpleAnimationPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Simple Animation Test</h1>
      
      {/* Test 1: Simple rotation */}
      <div className="mb-8">
        <h2 className="text-2xl text-white mb-4">Test 1: Rotation</h2>
        <div 
          className="w-20 h-20 bg-blue-500 rounded-full"
          style={{
            animation: 'spin 2s linear infinite'
          }}
        />
      </div>

      {/* Test 2: Pulse */}
      <div className="mb-8">
        <h2 className="text-2xl text-white mb-4">Test 2: Pulse</h2>
        <div 
          className="w-20 h-20 bg-green-500 rounded-full"
          style={{
            animation: 'pulse 1s ease-in-out infinite'
          }}
        />
      </div>

      {/* Test 3: Bounce */}
      <div className="mb-8">
        <h2 className="text-2xl text-white mb-4">Test 3: Bounce</h2>
        <div 
          className="w-20 h-20 bg-red-500 rounded-full"
          style={{
            animation: 'bounce 2s ease-in-out infinite'
          }}
        />
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0, -30px, 0);
            }
            70% {
              transform: translate3d(0, -15px, 0);
            }
            90% {
              transform: translate3d(0, -4px, 0);
            }
          }
        `
      }} />
    </div>
  );
} 