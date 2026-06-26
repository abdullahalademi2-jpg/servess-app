import React from 'react';

const CATEGORIES = [
  {
    id: "عمرة",
    title: "عمرة",

    icon: "🕋",
    gradient: "linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)",
    shadowColor: "rgba(5, 150, 105, 0.35)",
    activeGlow: "rgba(5, 150, 105, 0.2)"
  },
  {
    id: "تذاكر طيران",
    title: "تذاكر طيران",
    icon: "✈️",
    gradient: "linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fb923c 100%)",
    shadowColor: "rgba(234, 88, 12, 0.35)",
    activeGlow: "rgba(234, 88, 12, 0.2)"
  },
  {
    id: "زيارات عائلية",
    title: "زيارات عائلية",
    icon: "👨‍👩‍👧‍👦",
    gradient: "linear-gradient(135deg, #0e7490 0%, #06b6d4 50%, #67e8f9 100%)",
    shadowColor: "rgba(6, 182, 212, 0.35)",
    activeGlow: "rgba(6, 182, 212, 0.2)"
  },
  {
    id: "تأشيرات",
    title: "تأشيرات",
    icon: "https://img.icons8.com/fluency/96/identification-documents.png",
    gradient: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #60a5fa 100%)",
    shadowColor: "rgba(37, 99, 235, 0.35)",
    activeGlow: "rgba(37, 99, 235, 0.2)"
  },
  {
    id: "رحلات سفر",
    title: "رحلات سفر",

    icon: "🚌",
    gradient: "linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #818cf8 100%)",
    shadowColor: "rgba(79, 70, 229, 0.35)",
    activeGlow: "rgba(79, 70, 229, 0.2)"
  },
  {
    id: "شحن",
    title: "شحن",

    icon: "📦",
    gradient: "linear-gradient(135deg, #9d174d 0%, #db2777 50%, #f472b6 100%)",
    shadowColor: "rgba(219, 39, 119, 0.35)",
    activeGlow: "rgba(219, 39, 119, 0.2)"
  }
];

export default function ServicesGrid({ activeCategory, setActiveCategory, setSelectedCity, onShowAllAds }) {
  const handleCategoryClick = (categoryId) => {
    // عند اختيار خدمة من الشريط: نحولها إلى اختيار مدينة (كل الإعلانات)
    // حسب طلبك: نعتبر الضغط هنا يشغل اختيار المدينة
    if (typeof setSelectedCity === 'function') {
      setSelectedCity('الكل');
    }

    if (activeCategory === categoryId) {
      setActiveCategory('الكل');
    } else {
      setActiveCategory(categoryId);
      if (onShowAllAds) {
        onShowAllAds();
      }
    }
  };

  return (
    <div className="services-section">
      <div className="services-horizontal-scroll" role="list" aria-label="خدماتنا">
        {CATEGORIES.map((cat, index) => {
          const isActive = activeCategory === cat.id;
          return (
            <div
              key={cat.id}
              className={`service-card-modern ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                '--card-gradient': cat.gradient,
                '--card-shadow': cat.shadowColor,
                '--card-glow': cat.activeGlow,
                animationDelay: `${index * 0.08}s`
              }}
              role="listitem"
            >
              <div className="service-icon-wrapper">
                <div className="service-icon-bg" style={{ background: cat.gradient }}>
                  <div className="service-icon-shine" />
                </div>
                {cat.icon.startsWith('/') || cat.icon.startsWith('http') ? (
                  <img src={cat.icon} alt={cat.title} style={{ width: '32px', height: '32px', objectFit: 'contain', zIndex: 2, position: 'relative' }} />
                ) : (
                  <span className="service-icon-emoji">{cat.icon}</span>
                )}
              </div>

              <h3 className="service-card-title">{cat.title}</h3>

              {isActive && <div className="service-active-dot" style={{ background: cat.gradient }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
