import React, { useState, useEffect } from 'react';
import { Globe2 } from 'lucide-react';
import './SplashScreen.css';

export default function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState('entering');

  useEffect(() => {
    // Wait longer, then start exit animation
    const timer = setTimeout(() => {
      setStage('exiting');
    }, 6000);

    // After exit animation finishes, tell App to remove this component
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 7200); // Wait for the new longer curtain transition

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
          <Globe2 size={64} color="#1E3A8A" strokeWidth={2} />
        </div>
        <h1 className="splash-title">خدمة مكتب</h1>
        <h2 className="splash-slogan">جميع المكاتب في مكان واحد</h2>
        
        <div className="splash-services">
          <span style={{animationDelay: '1.5s'}}>عمرة</span>
          <span className="dot" style={{animationDelay: '1.7s'}}>•</span>
          <span style={{animationDelay: '1.9s'}}>تأشيرات</span>
          <span className="dot" style={{animationDelay: '2.1s'}}>•</span>
          <span style={{animationDelay: '2.3s'}}>زيارات عائلية</span>
          <span className="dot" style={{animationDelay: '2.5s'}}>•</span>
          <span style={{animationDelay: '2.7s'}}>تذاكر طيران</span>
          <span className="dot" style={{animationDelay: '2.9s'}}>•</span>
          <span style={{animationDelay: '3.1s'}}>رحلات سفر</span>
          <span className="dot" style={{animationDelay: '3.3s'}}>•</span>
          <span style={{animationDelay: '3.5s'}}>شحن</span>
        </div>

        <div className="splash-loader"></div>
      </div>
    </div>
  );
}
