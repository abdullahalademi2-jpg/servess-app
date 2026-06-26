import React, { useState, useEffect } from 'react';
import {
  Share2, Heart, MapPin, ShieldCheck,
  ArrowRight, Calendar, CheckCircle2, Star
} from 'lucide-react';
import { dataService } from '../services/dataService';

export default function AdDetails({ adId, onBackClick, officeUser, onEditAd, onOfficeClick }) {
  const [ad, setAd] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      setLoading(true);
      setImgLoaded(false);
      try {
        const adData = await dataService.getAdById(adId);
        if (active) {
          setAd(adData);
          const fav = await dataService.isFavorite(adId);
          setIsFav(fav);
          setLoading(false); // Stop loading immediately
          dataService.incrementAdView(adId).catch(console.error); // Fire and forget
        }
      } catch (err) {
        console.error(err);
        if (active) setLoading(false);
      }
    };
    fetch();
    return () => { active = false; };
  }, [adId]);

  const toggleFav = async () => {
    const updated = await dataService.toggleFavorite(ad.id);
    setIsFav(updated);
    if (updated) await dataService.incrementOfficeView(ad.officeId);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: ad.title, text: ad.description || ad.title, url: window.location.href }).catch(() => {});
    }
  };

  const whatsappUrl = (() => {
    if (!ad) return '#';
    const raw = (ad.phone || '').replace(/[^0-9+]/g, '');
    if (!raw) return '#';
    const num = raw.startsWith('+') ? raw.replace('+', '') : raw;
    const msg = encodeURIComponent(`مرحباً! 🤝تم تحويل هذا العميل إلى رقمك عبر منصة "خدمة مكتب".\n\nمرحبًا، مهتم بإعلان: ${ad.title}\nالمقدم من: ${ad.officeName}`);
    return `https://wa.me/${num}?text=${msg}`;
  })();

  const today = new Date().toLocaleDateString('ar-YE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  /* Loading */
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: '#f6f8fb',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16
      }}>
        <div className="loader-spinner" />
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>جاري التحميل...</span>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="empty-state-wrapper">
        <h3 className="empty-state-title">الإعلان غير موجود</h3>
        <button className="login-btn" onClick={onBackClick}>العودة للرئيسية</button>
      </div>
    );
  }

  return (
    /* Outer fixed overlay — position:fixed avoids being clipped by parent overflow */
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 2000,
      background: '#f6f8fb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

        {/* HERO IMAGE */}
        <div style={{ position: 'relative', width: '100%', height: 380, flexShrink: 0, background: '#0a1828' }}>
          <img
            src={ad.image}
            alt={ad.title}
            onLoad={() => setImgLoaded(true)}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80'; setImgLoaded(true); }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.5s ease', display: 'block'
            }}
          />
          {/* dark gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,24,40,0.40) 0%, rgba(10,24,40,0.0) 45%, rgba(10,24,40,0.65) 100%)'
          }} />

          {/* Category badge */}
          <div style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(212,175,55,0.92)', 
            color: '#0a1828', fontSize: 11, fontWeight: 800,
            padding: '5px 14px', borderRadius: 20,
            boxShadow: '0 4px 12px rgba(212,175,55,0.35)'
          }}>
            {ad.category}
          </div>

          {/* Back button */}
          <button onClick={onBackClick} style={{
            position: 'absolute', top: 12, right: 14,
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(255,255,255,0.88)', 
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: '#0a1828'
          }}>
            <ArrowRight size={18} />
          </button>

          {/* Fav */}
          <div style={{ position: 'absolute', bottom: 56, right: 14, display: 'flex', gap: 8 }}>
            <button onClick={toggleFav} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: isFav ? 'rgba(255,59,48,0.9)' : 'rgba(255,255,255,0.85)',
              
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}>
              <Heart size={15} fill={isFav ? '#fff' : 'none'} color={isFav ? '#fff' : '#0a1828'} />
            </button>
          </div>


        </div>

        {/* CARD BODY */}
        <div style={{
          background: '#f6f8fb',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          marginTop: -18,
          padding: '18px 14px 20px',
          position: 'relative', zIndex: 1
        }}>

          {/* Office Row */}
          <div 
            onClick={() => onOfficeClick && onOfficeClick(ad.officeId, ad.category)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', borderRadius: 16, padding: '12px 14px',
              marginBottom: 12,
              boxShadow: '0 4px 16px rgba(10,24,40,0.06)',
              border: '1px solid rgba(10,24,40,0.05)',
              cursor: 'pointer'
            }}
          >
            <img
              src={ad.officeLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&q=80'}
              alt={ad.officeName}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&q=80'; }}
              style={{
                width: 46, height: 46, borderRadius: '50%', objectFit: 'cover',
                border: '2.5px solid rgba(212,175,55,0.4)', flexShrink: 0
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#0a1828' }}>{ad.officeName}</span>
                <ShieldCheck size={14} color="#10b981" />
              </div>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                {ad.officeDescription || 'مكتب معتمد ومرخص'}
              </span>
            </div>
          </div>



          {/* Date + Reviews chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={chip('#1e40af')}>
              <Calendar size={11} />
              <span>{today}</span>
            </div>
            <div style={chip('#10b981')}>
              <CheckCircle2 size={11} />
              <span>{ad.reviews} تقييم</span>
            </div>
          </div>

          {/* Location */}
          <Block title="📍 الموقع الجغرافي">
            <LocRow 
              icon={<MapPin size={15} color="#3b82f6" />} 
              label="المحافظة - الشارع" 
              val={ad.street ? `${ad.city} - ${ad.street}` : ad.city} 
              bg="rgba(59,130,246,0.07)" 
            />
          </Block>

          {/* Additional Details */}
          <Block title="📋 تفاصيل الخدمة">
            {(() => {
              let displayDate = '';
              if (ad.createdAt) {
                const d = ad.createdAt?.toDate ? ad.createdAt.toDate() : new Date(ad.createdAt);
                if (!isNaN(d)) displayDate = d.toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              }
              if (!displayDate) displayDate = new Date().toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              
              return (
                <>
                  <InfoRow icon="📅" label="تاريخ إعلان الخدمة" val={displayDate} />
                  <InfoRow icon="✅" label="حالة الخدمة" val="متاحة الآن" />
                </>
              );
            })()}
            {(['رحلات سفر', 'تذاكر طيران', 'نقل', 'عمرة'].includes(ad.category)) && (
              <>
                {(ad.departureCity || ad.arrivalCity) && (
                  <InfoRow icon="🗺️" label="مسار الرحلة"
                    val={[ad.departureCity && `من: ${ad.departureCity}`, ad.arrivalCity && `إلى: ${ad.arrivalCity}`].filter(Boolean).join('  ←  ')} />
                )}
                {ad.transportCompany && ad.category !== 'رحلات سفر' && <InfoRow icon={ad.category === 'تذاكر طيران' ? '✈️' : '🚌'} label="الشركة الناقلة" val={ad.transportCompany} />}
                {ad.busType && ad.category === 'رحلات سفر' && <InfoRow icon="🚍" label="نوع الباص" val={ad.busType} />}

                {ad.transportTime && <InfoRow icon="⏰" label="وقت الانطلاق" val={ad.transportTime} />}
              </>
            )}

            <InfoRow icon="⏱️" label="فترة إنجاز المعاملة" val={ad.deliveryPeriod || ad.serviceDuration || 'يتم التحديد بعد الاتفاق تواصل معنا واتساب'} />
            {ad.description && (
              <div style={{
                marginTop: 6, background: 'rgba(10,24,40,0.03)',
                borderRadius: 12, padding: '12px 14px',
                border: '1px solid rgba(10,24,40,0.05)'
              }}>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, margin: 0, fontWeight: 500 }}>
                  {ad.description}
                </p>
              </div>
            )}
          </Block>



          {/* ── السعر ── */}
          <div style={{
            background: '#fff', borderRadius: 18, padding: '16px 14px',
            marginBottom: 12,
            boxShadow: '0 4px 16px rgba(10,24,40,0.05)',
            border: '1px solid rgba(10,24,40,0.04)'
          }}>
            <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 800, marginBottom: 4 }}>💰 السعر</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#0a1828', lineHeight: 1 }}>{ad.price}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>ر.س</span>
            </div>
          </div>

          {/* ── تقييم المكتب ── */}
          <Block title="⭐ تقييم المكتب">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>ما هو تقييمك لخدمات هذا المكتب؟</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setUserRating(star);
                    }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, transition: 'transform 0.2s'
                    }}
                  >
                    <Star 
                      size={24} 
                      fill={star <= (userRating || ad.rating || 0) ? "#d4af37" : "none"} 
                      color={star <= (userRating || ad.rating || 0) ? "#d4af37" : "#cbd5e1"} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </Block>

          {/* ── زر واتساب ── */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => { 
              if (!ad.phone) {
                e.preventDefault(); 
              } else {
                dataService.incrementWhatsappClick(ad.officeId).catch(console.error);
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#fff', borderRadius: 18, padding: '16px 20px',
              fontWeight: 800, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(37,211,102,0.35)',
              marginBottom: 30,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            تواصل عبر واتساب
          </a>

        </div>
      </div>
    </div>
  );
}

/* ── Small helpers ── */

function Block({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: '14px',
      marginBottom: 12,
      boxShadow: '0 4px 16px rgba(10,24,40,0.05)',
      border: '1px solid rgba(10,24,40,0.04)'
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function LocRow({ icon, label, val, bg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: bg, borderRadius: 12, padding: '10px 12px', marginBottom: 8
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 14, color: '#0a1828', fontWeight: 800 }}>{val}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, val }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#ffffff', borderRadius: 14,
      padding: '12px 14px', marginBottom: 10,
      border: '1px solid rgba(10,24,40,0.04)',
      boxShadow: '0 2px 12px rgba(10,24,40,0.03)'
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: 'rgba(212,175,55,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        fontSize: 18
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#0a1828', fontWeight: 800, lineHeight: 1.4 }}>{val}</div>
      </div>
    </div>
  );
}

function chip(color) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: `${color}14`, border: `1px solid ${color}25`,
    borderRadius: 20, padding: '5px 10px',
    fontSize: 10, fontWeight: 700, color,
  };
}
