import React, { useState, useRef, useEffect } from 'react';
import { Bell, MapPin, ChevronDown, Globe, Building2, Sparkles, MoreVertical, Info, Share2, Headphones, MessageCircle, Phone } from 'lucide-react';

export default function Header({ selectedCity, setSelectedCity, provinces }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setIsOpen(false);
  };

  // أغلق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // إغلاق تلقائي بعد 3 ثواني
  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => setIsOpen(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isMenuOpen) {
      timer = setTimeout(() => setIsMenuOpen(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [isMenuOpen]);


  useEffect(() => {
    const handleMenuOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleMenuOutsideClick);
      document.addEventListener('touchstart', handleMenuOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleMenuOutsideClick);
      document.removeEventListener('touchstart', handleMenuOutsideClick);
    };
  }, [isMenuOpen]);

  const handleShare = () => {
    // تم إيقاف التفعيل بناءً على طلب المستخدم
    setIsMenuOpen(false);
  };

  const handleAbout = () => {
    // تم إيقاف التفعيل بناءً على طلب المستخدم
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="header-wrapper">
        {/* Center: App Logo & Title */}
        <div className="app-logo-section">
          <div className="app-title-container" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="app-title" style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', whiteSpace: 'nowrap', lineHeight: '1.2' }}>خدمة مكتب</h1>
            </div>
          </div>
        </div>

        {/* Right: Location Selector with vertical dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              className="location-selector"
              onClick={() => setIsOpen(v => !v)}
              aria-label="اختر المحافظة"
            >
              <MapPin size={14} className="rating-star" style={{ color: 'var(--accent)' }} />
              <span>{selectedCity === 'الكل' ? 'المحافظة' : selectedCity}</span>
              <ChevronDown
                size={12}
                style={{
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>

            {/* Vertical dropdown list */}
            {isOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0, // Align it to the right so it doesn't go off screen
                minWidth: '160px',
                zIndex: 9999,
                background: '#ffffff', // Solid white to prevent transparency
                borderRadius: '16px',
                border: '1px solid rgba(10,24,40,0.1)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                {provinces.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: selectedCity === city ? '#eff6ff' : '#ffffff',
                      color: selectedCity === city ? '#2563eb' : '#0f172a',
                      fontWeight: selectedCity === city ? '800' : '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'right',
                      fontFamily: 'inherit',
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCity !== city) e.target.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCity !== city) e.target.style.background = '#ffffff';
                    }}
                  >
                    <span style={{
                      width: '14px', height: '14px',
                      borderRadius: '50%',
                      border: selectedCity === city ? '4px solid #2563eb' : '2px solid #cbd5e1',
                      background: selectedCity === city ? '#ffffff' : '#ffffff',
                      flexShrink: 0,
                    }} />
                    {city === 'الكل' ? 'المحافظة' : city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3 Dots Menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(v => !v)}
              style={{
                background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--primary)',
                padding: '4px', transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                 e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                 e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                minWidth: '180px',
                zIndex: 9999,
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid rgba(10,24,40,0.1)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                <button
                  onClick={handleAbout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px',
                    border: 'none', background: 'transparent',
                    color: '#0f172a', fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
                    width: '100%', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Info size={16} color="#3b82f6" />
                  حول البرنامج
                </button>
                <button
                  onClick={handleShare}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px',
                    border: 'none', background: 'transparent',
                    color: '#0f172a', fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
                    width: '100%', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Share2 size={16} color="#10b981" />
                  مشاركة الرابط
                </button>
                <button
                  onClick={() => { setIsSupportOpen(true); setIsMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px',
                    border: 'none', background: 'transparent',
                    color: '#0f172a', fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
                    width: '100%', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Headphones size={16} color="#8b5cf6" />
                  الدعم والمساعدة
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Support Modal */}
      {isSupportOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 100000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(4px)'
        }} onClick={() => setIsSupportOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: '24px', padding: '24px',
            width: '100%', maxWidth: '340px', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{
              width: '60px', height: '60px', background: '#f5f3ff',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <Headphones size={30} color="#8b5cf6" />
            </div>

            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px', fontWeight: '800' }}>الدعم والمساعدة</h3>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
              نحن هنا لمساعدتك! تواصل معنا عبر أي من الطرق التالية:
            </p>
            
            <a href="https://wa.me/967772054488" target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              background: '#25D366', color: '#fff', textDecoration: 'none',
              padding: '14px', borderRadius: '16px', marginBottom: '12px',
              fontWeight: 'bold', fontSize: '15px', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(37,211,102,0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <MessageCircle size={22} />
              خدمة العملاء (واتساب)
            </a>

            <a href="tel:774115429" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              background: '#3b82f6', color: '#fff', textDecoration: 'none',
              padding: '14px', borderRadius: '16px', marginBottom: '24px',
              fontWeight: 'bold', fontSize: '15px', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <Phone size={22} />
              اتصل بنا 
              <span style={{ direction: 'ltr', fontSize: '16px' }}>774115429</span>
            </a>

            <button onClick={() => setIsSupportOpen(false)} style={{
              background: '#f1f5f9', color: '#475569', border: 'none',
              padding: '14px', width: '100%', borderRadius: '16px',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '15px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
              إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
}
