import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState('entering');

  useEffect(() => {
    // Wait a bit, then start exit animation
    const timer = setTimeout(() => {
      setStage('exiting');
    }, 2500);

    // After exit animation finishes, tell App to remove this component
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3300); // slightly longer to allow curtain animation to finish

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen-container ${stage}`}>
      <div className="splash-curtain left"></div>
      <div className="splash-curtain right"></div>
      
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <svg className="splash-logo" viewBox="0 0 24 24" fill="#1E3A8A" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22h20L12 2zm0 3.99L18.66 19H5.34L12 5.99z"/>
          </svg>
        </div>
        <h1 className="splash-title">خدمة مكتب</h1>
        <p className="splash-subtitle">نجهز لك تجربة مميزة...</p>
        <div className="splash-loader"></div>
      </div>
    </div>
  );
}
