import React, { useState, useEffect } from 'react';
import { Star, MapPin, Eye, Briefcase, MessageCircle, ArrowRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import AdCard from '../components/AdCard';

export default function OfficeProfile({ officeId, onBackClick, onAdDetailClick, officeUser, onEditAd, initialService = 'الكل' }) {
  const [office, setOffice] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState(initialService);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const officeData = await dataService.getOfficeById(officeId);
        const officeAds = await dataService.getAds({ officeId: officeId });
        if (active) {
          setOffice(officeData);
          setAds(officeAds);
          
          // Check if user already rated this office within the last month
          const savedDate = localStorage.getItem(`rated_office_date_${officeId}`);
          const savedStar = localStorage.getItem(`rated_office_star_${officeId}`);

          if (savedDate && savedStar) {
            const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
            if (Date.now() - Number(savedDate) < oneMonthMs) {
              setUserRating(Number(savedStar));
              setRatingSubmitted(true);
            } else {
              localStorage.removeItem(`rated_office_date_${officeId}`);
              localStorage.removeItem(`rated_office_star_${officeId}`);
            }
          }

          // Increment office views
          await dataService.incrementOfficeView(officeId);
          // Optimistically update the view count in local state
          setOffice(prev => ({ ...prev, views: (prev.views || 0) + 1 }));
        }
      } catch (err) {
        console.error("خطأ في تحميل بيانات المكتب:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [officeId]);

  const handleRate = async (star) => {
    if (ratingSubmitted || ratingLoading) return;
    if (officeUser && officeUser.uid === officeId) return; // لا يمكن تقييم مكتبك
    setRatingLoading(true);
    try {
      const updatedOffice = await dataService.rateOffice(officeId, star);
      setUserRating(star);
      setRatingSubmitted(true);
      localStorage.setItem(`rated_office_date_${officeId}`, Date.now().toString());
      localStorage.setItem(`rated_office_star_${officeId}`, String(star));
      if (updatedOffice) setOffice(updatedOffice);
    } catch (err) {
      console.error('خطأ في التقييم:', err);
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader-spinner" />
      </div>
    );
  }

  if (!office) {
    return (
      <div className="empty-state-wrapper">
        <h3 className="empty-state-title">المكتب غير موجود</h3>
        <button className="login-btn" onClick={onBackClick}>العودة للرئيسية</button>
      </div>
    );
  }

  // Build WhatsApp link
  const whatsappLink = (() => {
    const phone = (office.phone || "").replace(/[^0-9+]/g, "");
    const message = encodeURIComponent(`مرحباً! 🤝تم تحويل هذا العميل إلى رقمك عبر منصة "خدمة مكتب".\n\nمرحبًا، أرغب في التواصل مع ${office.name}`);
    if (!phone) return "#";
    const normalized = phone.startsWith("+") ? phone.replace("+", "") : phone;
    return `https://wa.me/${normalized}?text=${message}`;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* 1. Office Profile Header */}
      <div className="office-profile-header">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <button
            onClick={onBackClick}
            aria-label="رجوع"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: '#ffffff',
              color: '#0f172a',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              position: 'relative',
              zIndex: 10
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
          >
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="office-profile-avatar-section">
          <div className="office-profile-avatar-ring">
            <img
              src={office.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(office.name)}&background=0a1828&color=fff`}
              alt={office.name}
              className="office-profile-avatar"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=120&h=120&q=80";
              }}
            />
          </div>
          <h2 className="office-profile-name">{office.name}</h2>
          <div className="office-profile-location">
            <MapPin size={13} />
            <span>{office.city}{office.street ? ` — ${office.street}` : ''}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="office-profile-stats">
          <div className="office-profile-stat">
            <Star size={16} fill="currentColor" className="rating-star" />
            <span className="office-profile-stat-val">{office.rating}</span>
            <span className="office-profile-stat-label">التقييم</span>
          </div>
          <div className="office-profile-stat-divider" />
          <div className="office-profile-stat">
            <Briefcase size={16} />
            <span className="office-profile-stat-val">{ads.length}</span>
            <span className="office-profile-stat-label">خدمات</span>
          </div>
          <div className="office-profile-stat-divider" />
          <div className="office-profile-stat">
            <Eye size={16} />
            <span className="office-profile-stat-val">{office.views || 0}</span>
            <span className="office-profile-stat-label">مشاهدة</span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="office-profile-body">
        
        {/* About Section */}
        <div className="office-profile-about">
          <h3 className="office-profile-section-title">عن المكتب</h3>
          <p className="office-profile-about-text">
            {office.description || "مكتب متخصص في تقديم أفضل الخدمات والتأشيرات وخدمات السفر. نسعى دائماً لتلبية احتياجات عملائنا بأعلى معايير الجودة والاحترافية والسرعة في الإنجاز."}
          </p>
        </div>

        {/* Rating UI Section */}
        {(!officeUser || officeUser.uid !== office.id) && (
          <div style={{ marginTop: '24px', marginBottom: '24px', textAlign: 'center' }}>
            {!ratingSubmitted && (
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '12px' }}>
                قيّم هذا المكتب
              </p>
            )}
            {ratingSubmitted && (
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', marginBottom: '12px' }}>
                شكراً لتقييمك!
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', direction: 'ltr' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={ratingSubmitted || ratingLoading}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => !ratingSubmitted && setHoverRating(star)}
                  onMouseLeave={() => !ratingSubmitted && setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: ratingSubmitted ? 'default' : 'pointer',
                    padding: '4px',
                    transition: 'all 0.2s',
                    transform: hoverRating === star ? 'scale(1.2)' : 'scale(1)'
                  }}
                >
                  <Star 
                    size={28} 
                    fill={(hoverRating || userRating) >= star ? 'var(--accent)' : 'transparent'} 
                    color={(hoverRating || userRating) >= star ? 'var(--accent)' : 'var(--text-light)'} 
                  />
                </button>
              ))}
            </div>
            {ratingLoading && <span className="loader-spinner" style={{ width: 16, height: 16, marginTop: '8px' }} />}
          </div>
        )}

        {/* Services Tags — Clickable Filter */}
        {(() => {
          const displayServices = office.services && office.services.length > 0 
            ? office.services 
            : ['عمرة', 'تذاكر طيران', 'زيارات عائلية', 'تأشيرات', 'رحلات سفر', 'شحن'];
            
          return (
            <div className="office-profile-services-tags">
              <h3 className="office-profile-section-title">الخدمات المقدمة <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)' }}>(اضغط لتصفية الإعلانات)</span></h3>
              <div className="office-services-tag-list">
                <span
                  className={`office-service-tag ${activeService === 'الكل' ? 'active' : ''}`}
                  onClick={() => setActiveService('الكل')}
                >
                  الكل
                </span>
                {displayServices.map((service, i) => (
                  <span
                    key={i}
                    className={`office-service-tag ${activeService === service ? 'active' : ''}`}
                    onClick={() => setActiveService(activeService === service ? 'الكل' : service)}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Ads Section — Filtered by activeService */}
        {(() => {
          const filteredAds = activeService === 'الكل'
            ? ads
            : ads.filter(ad => ad.category === activeService);

          return (
            <div className="office-profile-services-section">
              <div className="section-title-wrapper" style={{ marginTop: '8px' }}>
                <h3 className="section-title">
                  {activeService === 'الكل' ? 'جميع إعلانات المكتب' : `إعلانات ${activeService}`}
                </h3>
                <span className="office-profile-ads-count">{filteredAds.length} إعلان</span>
              </div>

              {filteredAds.length === 0 ? (
                <div className="empty-state-wrapper">
                  <div className="empty-state-icon">📋</div>
                  <h3 className="empty-state-title">
                    {activeService === 'الكل'
                      ? 'لا توجد إعلانات حالياً'
                      : `لا توجد إعلانات لخدمة "${activeService}"`
                    }
                  </h3>
                  <p className="empty-state-desc">
                    {activeService === 'الكل'
                      ? 'هذا المكتب لم ينشر أي إعلانات خدمات بعد.'
                      : 'جرّب اختيار خدمة أخرى أو اضغط "الكل" لعرض جميع الإعلانات.'
                    }
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '30px' }}>
                  {filteredAds.map((ad) => (
                    <div key={ad.id} style={{ minWidth: 'auto', width: '100%', position: 'relative' }}>
                      <AdCard
                        ad={ad}
                        onDetailClick={onAdDetailClick}
                      />
                      {officeUser && officeUser.uid === office.id && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button 
                            style={{ flex: 1, padding: '8px', background: 'var(--primary-light)', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => onEditAd(ad)}
                          >
                            تعديل
                          </button>
                          <button 
                            style={{ flex: 1, padding: '8px', background: 'var(--danger)', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={async () => {
                              if (await window.appConfirm("هل أنت متأكد من حذف الإعلان؟")) {
                                await dataService.deleteAd(ad.id);
                                setAds(ads.filter(a => a.id !== ad.id));
                              }
                            }}
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* WhatsApp CTA (Non-Sticky, at the bottom) */}
        {office.phone && (
          <div style={{ marginTop: '20px' }}>
            <a
              className="office-profile-wsp-btn"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              onClick={() => dataService.incrementWhatsappClick(office.id).catch(console.error)}
            >
              <MessageCircle size={18} />
              <span>تواصل عبر واتساب</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
