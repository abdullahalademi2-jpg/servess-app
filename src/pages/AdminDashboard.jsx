import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { ArrowRight, Trash2, CheckCircle, ShieldAlert, Building2, Megaphone, Ban, Search, Filter } from 'lucide-react';
import AdCard from '../components/AdCard';

export default function AdminDashboard({ adminUser, onLogout, onAdDetailClick, onOfficeClick }) {
  const [offices, setOffices] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offices'); // 'offices' or 'ads'

  // Search & Filter States
  const [officeSearchQuery, setOfficeSearchQuery] = useState('');
  const [officeStatusFilter, setOfficeStatusFilter] = useState('all');
  const [adSearchQuery, setAdSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const allOffices = await dataService.getOffices({ city: 'الكل', admin: true });
      setOffices(allOffices);
      
      const allAds = await dataService.getAds({ category: 'الكل', city: 'الكل' });
      setAds(allAds);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveOffice = async (officeId) => {
    if (await window.appConfirm("هل أنت متأكد من الموافقة على هذا المكتب وتفعيله؟")) {
      try {
        await dataService.approveOffice(officeId);
        alert("تم تفعيل المكتب بنجاح.");
        loadData();
      } catch (err) {
        alert("حدث خطأ: " + err.message);
      }
    }
  };

  const handleSuspendOffice = async (officeId) => {
    if (await window.appConfirm("تحذير: هل أنت متأكد من إيقاف هذا المكتب مؤقتاً عن نشر الإعلانات؟")) {
      try {
        await dataService.suspendOffice(officeId);
        alert("تم إيقاف المكتب بنجاح.");
        loadData();
      } catch (err) {
        alert("حدث خطأ: " + err.message);
      }
    }
  };

  const handleDeleteOffice = async (officeId) => {
    if (await window.appConfirm("تحذير: هل أنت متأكد من حذف هذا المكتب وجميع إعلاناته بشكل نهائي؟")) {
      try {
        await dataService.deleteOffice(officeId);
        alert("تم حذف المكتب وجميع إعلاناته بنجاح.");
        loadData();
      } catch (err) {
        alert("حدث خطأ: " + err.message);
      }
    }
  };

  const handleDeleteAd = async (adId) => {
    if (await window.appConfirm("تحذير: هل أنت متأكد من حذف هذا الإعلان بشكل نهائي؟")) {
      try {
        await dataService.deleteAd(adId);
        alert("تم حذف الإعلان بنجاح.");
        loadData();
      } catch (err) {
        alert("حدث خطأ: " + err.message);
      }
    }
  };

  const totalViews = offices.reduce((sum, off) => sum + (off.views || 0), 0);
  const totalWhatsappClicks = offices.reduce((sum, off) => sum + (off.whatsappClicks || 0), 0);

  // Filter logic
  const filteredOffices = offices.filter(o => {
    const q = officeSearchQuery.toLowerCase();
    const matchesSearch = (o.name?.toLowerCase() || '').includes(q) || (o.phone || '').includes(q) || (o.email?.toLowerCase() || '').includes(q);
    const matchesStatus = officeStatusFilter === 'all' || o.status === officeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAds = ads.filter(a => {
    const q = adSearchQuery.toLowerCase();
    return (a.title?.toLowerCase() || '').includes(q) || (a.officeName?.toLowerCase() || '').includes(q) || (a.category || '').includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Bar for Back/Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0 16px' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--card-bg)', color: 'var(--text-main)',
            border: '1px solid rgba(10, 24, 40, 0.08)', borderRadius: '20px', padding: '6px 16px',
            fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <ArrowRight size={16} />
          <span>تسجيل خروج</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '800' }}>
          <ShieldAlert size={18} />
          <span>لوحة الإدارة</span>
        </div>
      </div>

      {/* Stats Dashboard Widget */}
      <div className="dashboard-stats-grid" style={{ marginTop: '16px' }}>
        <div className="dashboard-stat-card">
          <div style={{ fontSize: '13px', marginBottom: '1px' }}><Building2 size={16}/></div>
          <span className="stat-val">{offices.length}</span>
          <span className="stat-lbl">إجمالي المكاتب</span>
        </div>
        <div className="dashboard-stat-card">
          <div style={{ fontSize: '13px', marginBottom: '1px' }}><Megaphone size={16}/></div>
          <span className="stat-val">{ads.length}</span>
          <span className="stat-lbl">إجمالي الإعلانات</span>
        </div>
        <div className="dashboard-stat-card">
          <div style={{ fontSize: '13px', marginBottom: '1px' }}>👁️</div>
          <span className="stat-val">{totalViews}</span>
          <span className="stat-lbl">إجمالي المشاهدات</span>
        </div>
        <div className="dashboard-stat-card">
          <div style={{ fontSize: '13px', marginBottom: '1px' }}>💬</div>
          <span className="stat-val">{totalWhatsappClicks}</span>
          <span className="stat-lbl">نقرات الواتساب</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '10px', padding: '16px', borderBottom: '1px solid rgba(10,24,40,0.05)' }}>
        <button 
          onClick={() => setActiveTab('offices')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
            background: activeTab === 'offices' ? 'var(--primary)' : 'rgba(37,99,235,0.05)',
            color: activeTab === 'offices' ? '#fff' : 'var(--primary)'
          }}
        >
          إدارة المكاتب
        </button>
        <button 
          onClick={() => setActiveTab('ads')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
            background: activeTab === 'ads' ? 'var(--primary)' : 'rgba(37,99,235,0.05)',
            color: activeTab === 'ads' ? '#fff' : 'var(--primary)'
          }}
        >
          إدارة الإعلانات
        </button>
      </div>

      {/* Content Area */}
      <div style={{ padding: '0 16px 30px 16px', flex: '1', overflowY: 'auto' }}>
        {loading ? (
          <div className="loader-spinner" style={{ marginTop: '40px' }} />
        ) : activeTab === 'offices' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px' }}>
            
            {/* Office Filters & Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '4px' }}>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="ابحث باسم المكتب، أو الهاتف..."
                  value={officeSearchQuery}
                  onChange={e => setOfficeSearchQuery(e.target.value)}
                />
                <Search className="search-icon" size={18} />
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[{id: 'all', label: 'الكل'}, {id: 'pending', label: 'قيد المراجعة'}, {id: 'active', label: 'نشط'}, {id: 'suspended', label: 'موقوف'}].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setOfficeStatusFilter(filter.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                      background: officeStatusFilter === filter.id ? 'var(--primary)' : 'var(--card-bg)',
                      color: officeStatusFilter === filter.id ? '#fff' : 'var(--text-main)', transition: 'all 0.2s'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredOffices.map(office => (
              <div key={office.id} style={{
                background: 'var(--card-bg)', borderRadius: '16px', padding: '16px',
                border: '1px solid ' + (office.status === 'pending' ? '#f59e0b' : 'rgba(10,24,40,0.08)'),
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={office.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(office.name)}&background=0a1828&color=fff`} alt={office.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => onOfficeClick && onOfficeClick(office.id)} />
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onOfficeClick && onOfficeClick(office.id)}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{office.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>📍 {office.city} | 📞 {office.phone}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '11px', color: 'var(--text-main)', fontWeight: '600' }}>
                      <span>👁️ {office.views || 0} مشاهدة</span>
                      <span style={{ color: '#25D366' }}>💬 {office.whatsappClicks || 0} تواصل واتساب</span>
                    </div>
                  </div>
                  {office.status === 'pending' && (
                    <span style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>قيد المراجعة</span>
                  )}
                  {office.status === 'active' && (
                    <span style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>نشط</span>
                  )}
                  {office.status === 'suspended' && (
                    <span style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>موقوف مؤقتاً</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {(office.status === 'pending' || office.status === 'suspended') && (
                    <button 
                      onClick={() => handleApproveOffice(office.id)}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <CheckCircle size={14} /> تفعيل الحساب
                    </button>
                  )}
                  {office.status === 'active' && (
                    <button 
                      onClick={() => handleSuspendOffice(office.id)}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Ban size={14} /> إيقاف المكتب
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteOffice(office.id)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} /> حذف المكتب نهائياً
                  </button>
                </div>
              </div>
            ))}
            {filteredOffices.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا يوجد مكاتب مطابقة</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px' }}>
            {/* Ads Search */}
            <div className="search-input-wrapper" style={{ marginBottom: '4px' }}>
              <input
                type="text"
                className="search-input"
                placeholder="ابحث بعنوان الإعلان أو الخدمة..."
                value={adSearchQuery}
                onChange={e => setAdSearchQuery(e.target.value)}
              />
              <Search className="search-icon" size={18} />
            </div>

            {filteredAds.map(ad => (
              <div key={ad.id} style={{ position: 'relative' }}>
                <AdCard ad={ad} onDetailClick={onAdDetailClick} />
                <button
                  onClick={() => handleDeleteAd(ad.id)}
                  style={{
                    position: 'absolute', top: '10px', left: '10px', width: '32px', height: '32px',
                    borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220,38,38,0.3)', zIndex: 10
                  }}
                  title="حذف الإعلان"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {filteredAds.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد إعلانات مطابقة</p>}
          </div>
        )}
      </div>
    </div>
  );
}
