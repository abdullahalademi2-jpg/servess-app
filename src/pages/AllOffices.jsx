import React, { useState, useEffect } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import OfficeCard from '../components/OfficeCard';
import { dataService } from '../services/dataService';

export default function AllOffices({ onBackClick, onOfficeClick, selectedCity }) {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchOffices = async () => {
      setLoading(true);
      try {
        const officeList = await dataService.getOffices({ city: selectedCity });
        // Sort by views if needed, or just show all
        if (active) setOffices(officeList);
      } catch (err) {
        console.error("خطأ في تحميل جميع المكاتب:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOffices();
    return () => { active = false; };
  }, [selectedCity]);

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
          جميع المكاتب {selectedCity && selectedCity !== 'الكل' ? `(${selectedCity})` : ''}
        </h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px' }}>
        {loading ? (
          <div className="loader-spinner" style={{ margin: '40px auto' }} />
        ) : offices.length === 0 ? (
          <div className="empty-state-wrapper" style={{ marginTop: 40 }}>
            <div className="empty-state-icon">
              <Search size={32} />
            </div>
            <h3 className="empty-state-title">لا توجد مكاتب</h3>
            <p className="empty-state-desc">لم نتمكن من العثور على أي مكاتب مسجلة حالياً.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px'
          }}>
            {offices.map(office => (
              <div key={office.id} style={{ width: '100%' }}>
                <OfficeCard office={office} onClick={() => onOfficeClick(office.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
