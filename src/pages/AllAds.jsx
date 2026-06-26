import React, { useState, useEffect } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import AdCard from '../components/AdCard';
import { dataService } from '../services/dataService';

export default function AllAds({ onBackClick, onAdDetailClick, activeCategory, selectedCity }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchAds = async () => {
      setLoading(true);
      try {
        // Fetch ALL ads with the current filters but no limit
        const filter = {
          category: activeCategory,
          city: selectedCity,
          randomize: false
        };
        const adsList = await dataService.getAds(filter);
        if (active) setAds(adsList);
      } catch (err) {
        console.error("خطأ في تحميل جميع الإعلانات:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAds();
    return () => { active = false; };
  }, [activeCategory, selectedCity]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000,
      background: '#f6f8fb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 16px 16px',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <button
          onClick={onBackClick}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(10,24,40,0.04)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#0a1828'
          }}
        >
          <ArrowRight size={18} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0a1828' }}>
          جميع الإعلانات {
            (selectedCity !== 'الكل' || activeCategory !== 'الكل') 
              ? ` (${[selectedCity !== 'الكل' ? selectedCity : null, activeCategory !== 'الكل' ? activeCategory : null].filter(Boolean).join(' - ')})` 
              : ''
          }
        </h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px' }}>
        {loading ? (
          <div className="loader-spinner" style={{ margin: '40px auto' }} />
        ) : ads.length === 0 ? (
          <div className="empty-state-wrapper" style={{ marginTop: 40 }}>
            <div className="empty-state-icon">
              <Search size={32} />
            </div>
            <h3 className="empty-state-title">لا توجد إعلانات</h3>
            <p className="empty-state-desc">لم نتمكن من العثور على إعلانات تطابق بحثك الحالي.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {ads.map(ad => (
              <div key={ad.id} style={{ width: '100%' }}>
                <AdCard ad={ad} onDetailClick={onAdDetailClick} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
