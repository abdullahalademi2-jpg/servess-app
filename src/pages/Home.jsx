import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ServicesGrid from '../components/ServicesGrid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-creative';

import AdCard from '../components/AdCard';
import OfficeCard from '../components/OfficeCard';
import { dataService } from '../services/dataService';
import { ArrowLeft } from 'lucide-react';

export default function Home({ onAdDetailClick, onOfficeClick, onShowAllAds, onShowAllOffices, activeCategory, setActiveCategory, selectedCity, setSelectedCity }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [ads, setAds] = useState([]);

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load static resources once
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const provs = await dataService.getProvinces();
        setProvinces(provs);
      } catch (err) {
        console.error("خطأ في تحميل المحافظات:", err);
      }
    };
    loadStaticData();
  }, []);

  // Load offices whenever city or search changes
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const officeList = await dataService.getOffices({ city: selectedCity, searchQuery });
        const sortedOffices = [...officeList].sort((a, b) => (b.views || 0) - (a.views || 0));
        setOffices(sortedOffices);
      } catch (err) {
        console.error("خطأ في تحميل المكاتب:", err);
      }
    };
    
    const timer = setTimeout(fetchOffices, 400);
    return () => clearTimeout(timer);
  }, [selectedCity, searchQuery]);

  // Reload ads when filters change
  useEffect(() => {
    const fetchAds = async () => {
      if (ads.length === 0) setLoading(true);
      try {
        const showAll = activeCategory === 'الكل';

        const filter = {
          category: activeCategory,
          city: selectedCity,
          searchQuery: searchQuery,
          ...(showAll ? {} : { limit: 6 }),
          randomize: false
        };
        const adsList = await dataService.getAds(filter);
        setAds(adsList);
      } catch (err) {
        console.error("خطأ في تحميل الإعلانات:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchAds, 400);
    return () => clearTimeout(timer);
  }, [activeCategory, selectedCity, searchQuery]);


  return (
    <div>
      {/* 1. Header with City Selector */}
      <Header 
        selectedCity={selectedCity} 
        setSelectedCity={(city) => {
          setSelectedCity(city);
          setActiveCategory('الكل');
        }} 
        provinces={provinces} 
      />

      <div className="app-content-body" style={{ marginTop: '0px' }}>
        
        {/* 2. Search Box */}
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          onFilterClick={() => alert("سيتم إضافة ميزات التصفية المتقدمة قريباً")}
        />

        {/* 3. Services Grid */}
        <ServicesGrid 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
          onShowAllAds={onShowAllAds}
        />



        {/* 5. Latest Ads Title */}
        <div className="section-title-wrapper">
          <h2 className="section-title">
            أحدث الإعلانات {selectedCity && selectedCity !== 'الكل' ? `(${selectedCity})` : ''}
          </h2>
          <span 
            style={{ fontSize: 13, color: '#3b82f6', fontWeight: 800, cursor: 'pointer' }}
            onClick={onShowAllAds}
          >
            عرض الكل
          </span>
        </div>

        {loading ? (
          <div className="loader-spinner" />
        ) : ads.length === 0 ? (
          <div className="empty-state-wrapper">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">لا توجد إعلانات مطابقة</h3>
            <p className="empty-state-desc">يرجى تجربة تغيير خيارات البحث أو تصفية المدن والخدمات لرؤية المزيد.</p>
          </div>
        ) : (
          <div style={{ width: '100%', overflow: 'hidden', paddingBottom: '20px', paddingTop: '0px', marginTop: '-5px' }}>
            <Swiper
              effect={'creative'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={Math.floor(ads.length / 2)}
              creativeEffect={{
                prev: {
                  shadow: true,
                  translate: ['-120%', 0, -500],
                  scale: 0.5,
                  opacity: 0,
                  rotate: [0, 0, -15],
                },
                next: {
                  shadow: true,
                  translate: ['120%', 0, -500],
                  scale: 0.5,
                  opacity: 0,
                  rotate: [0, 0, 15],
                },
              }}
              loop={false}
              preventClicks={false}
              preventClicksPropagation={false}
              touchStartPreventDefault={false}
              onTap={(swiper) => {
                const index = swiper.clickedIndex !== undefined ? swiper.clickedIndex : swiper.activeIndex;
                if (ads[index]) {
                  onAdDetailClick(ads[index].id);
                }
              }}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              modules={[EffectCreative, Autoplay]}
              style={{ padding: '5px 0 20px 0', position: 'relative' }}
              className="magical-swiper"
            >
              {/* الشريط العلوي للحلقة */}
              <div style={{ position: 'absolute', top: '5px', left: '0', right: '0', height: '12px', background: 'linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.4) 50%, rgba(212,175,55,0) 100%)', borderRadius: '50%', borderTop: '2px solid rgba(212,175,55,0.8)', borderBottom: '2px solid rgba(212,175,55,0.2)', zIndex: -1, pointerEvents: 'none' }}></div>
              
              {/* الشريط السفلي للحلقة */}
              <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', height: '12px', background: 'linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.4) 50%, rgba(212,175,55,0) 100%)', borderRadius: '50%', borderBottom: '2px solid rgba(212,175,55,0.8)', borderTop: '2px solid rgba(212,175,55,0.2)', zIndex: -1, pointerEvents: 'none' }}></div>

              {ads.map((ad) => (
                <SwiperSlide key={ad.id} style={{ width: '100vw', maxWidth: '900px', display: 'flex', justifyContent: 'center' }}>
                  <AdCard 
                    ad={ad} 
                    onDetailClick={onAdDetailClick} 
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* 7. Most Viewed Offices ("المكاتب الأكثر مشاهدة") */}
        <div className="section-title-wrapper">
          <h2 className="section-title">
            المكاتب الأكثر مشاهدة {selectedCity && selectedCity !== 'الكل' ? `(${selectedCity})` : ''}
          </h2>
          <span 
            style={{ fontSize: 13, color: '#3b82f6', fontWeight: 800, cursor: 'pointer' }}
            onClick={onShowAllOffices}
          >
            عرض الكل
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px',
          padding: '0 16px 20px 16px'
        }}>
          {offices.map((office) => (
            <div key={office.id} style={{ width: '100%' }}>
              <OfficeCard 
                office={office} 
                onClick={() => onOfficeClick && onOfficeClick(office.id)}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
