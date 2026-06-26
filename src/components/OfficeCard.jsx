import React from 'react';
import { Star } from 'lucide-react';

const OfficeCard = React.memo(function OfficeCard({ office, onClick }) {
  return (
    <div className="office-box-card" onClick={() => onClick && onClick(office.id)}>
      <img src={office.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(office.name)}&background=0a1828&color=fff`} alt={office.name} className="office-logo" loading="lazy" />
      <h4 className="office-box-name" style={{ marginBottom: '2px' }}>{office.name}</h4>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 'auto' }}>
        {office.city}{office.street ? ` — ${office.street}` : ''}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <div className="office-box-rating">
          <Star size={10} className="rating-star" fill="currentColor" />
          <span>{office.rating}</span>
        </div>
      </div>
    </div>
  );
});

export default OfficeCard;
