import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar } from 'lucide-react';
import { dataService } from '../services/dataService';

const AdCard = React.memo(function AdCard({ ad, onDetailClick }) {
  const [officeLogo, setOfficeLogo] = useState(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      let logo = ad.officeLogo;
      if (!logo && ad.officeId) {
        const off = await dataService.getOfficeById(ad.officeId);
        if (off && off.logo) logo = off.logo;
      }
      if (active) {
        if (logo) setOfficeLogo(logo);
      }
    };
    loadData();
    return () => { active = false; };
  }, [ad.id, ad.officeId, ad.officeLogo]);

  const handleDetailsClick = (e) => {
    onDetailClick(ad.id);
  };

  return (
    <div className="ad-card" onClick={handleDetailsClick} style={{ cursor: 'pointer' }}>
      <div className="ad-img-container">
        <img src={ad.image} alt={ad.title} className="ad-img" loading="lazy" />
        <span className="ad-service-badge">{ad.category}</span>
      </div>

      <div className="ad-card-body" style={{ textAlign: 'right', padding: '12px 10px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <img 
            src={officeLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&q=80'} 
            alt="logo" 
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', padding: 0, margin: 0, zIndex: 1 }}
            loading="lazy"
            onError={(e) => e.target.style.display = 'none'}
          />
          <h4 className="ad-office-name" style={{ fontSize: '12px', fontWeight: '700', margin: 0, padding: 0, lineHeight: 1.2, color: 'var(--primary)' }}>
            {ad.officeName}
          </h4>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textAlign: 'right', width: '100%', paddingRight: '36px' }}>
          {ad.city}{ad.street ? ` — ${ad.street}` : ''}
        </div>
        
        {/* التاريخ فوق السعر */}
        {(() => {
          let displayDate = '';
          if (ad.transportDate) {
            displayDate = new Date(ad.transportDate).toLocaleDateString('ar-YE');
          } else if (ad.createdAt) {
            const d = ad.createdAt?.toDate ? ad.createdAt.toDate() : new Date(ad.createdAt);
            if (!isNaN(d)) displayDate = d.toLocaleDateString('ar-YE');
          }
          return displayDate ? (
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Calendar size={10} />
              <span>{displayDate}</span>
            </div>
          ) : null;
        })()}

        {/* السعر في المنتصف وبدون مسافة */}
        {typeof ad.price !== 'undefined' && ad.price !== null && (
          <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--accent)', marginTop: '0', textAlign: 'center' }}>
            {ad.price}<span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>ر.س</span>
          </div>
        )}

      </div>

      <div className="ad-card-footer">
        <button 
          className="btn-ad-details"
          onClick={handleDetailsClick}
        >
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
});

export default AdCard;
