import React, { useState, useEffect, useRef } from 'react';
import Home from './pages/Home';
const AdDetails = React.lazy(() => import('./pages/AdDetails'));
const OfficeProfile = React.lazy(() => import('./pages/OfficeProfile'));
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AllAds = React.lazy(() => import('./pages/AllAds'));
const AllOffices = React.lazy(() => import('./pages/AllOffices'));
import BottomNav from './components/BottomNav';
import AdCard from './components/AdCard';
import { dataService } from './services/dataService';
import { Search, Heart, ArrowRight } from 'lucide-react';
import SideNav from './components/SideNav';
import SplashScreen from './components/SplashScreen';


export default function App() {
  const [showSplash, setShowSplash] = useState(true); // Set to true to show it on load for now
  const [activeTab, setActiveTab] = useState('home');
  const [tabHistory, setTabHistory] = useState(['home']);
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  const [selectedOfficeService, setSelectedOfficeService] = useState('الكل');

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ tab: 'home' }, '');
    }

    const handlePopState = (event) => {
      setTabHistory(prev => {
        if (prev.length <= 1) {
          setActiveTab('home');
          return ['home'];
        }
        const newHist = [...prev];
        newHist.pop();
        setActiveTab(newHist[newHist.length - 1]);
        return newHist;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const pushTab = (tab) => {
    setTabHistory(prev => [...prev, tab]);
    setActiveTab(tab);
    window.history.pushState({ tab }, '');
  };

  const popTab = () => {
    if (tabHistory.length > 1) {
      window.history.back();
    } else {
      setActiveTab('home');
    }
  };
  
  // Shared filter states (between home & search)
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('saved_city') || 'الكل');
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const pendingActionRef = useRef(null);

  // Save selectedCity to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('saved_city', selectedCity);
  }, [selectedCity]);

  // Edit Ad State
  const [adToEdit, setAdToEdit] = useState(null);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [officeUser, setOfficeUser] = useState(null);

  // Favorites List State (Refreshes when Favorites tab is opened)
  const [favoriteAds, setFavoriteAds] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Load favorites when activeTab becomes 'favorites'
  useEffect(() => {
    if (activeTab === 'favorites') {
      const loadFavorites = async () => {
        setLoadingFavorites(true);
        try {
          const list = await dataService.getFavorites();
          setFavoriteAds(list);
        } catch (err) {
          console.error("خطأ في تحميل المفضلة:", err);
        } finally {
          setLoadingFavorites(false);
        }
      };
      loadFavorites();
    }
  }, [activeTab]);

  // Navigate to Ad details
  const handleAdDetailClick = (id) => {
    setSelectedAdId(id);
    pushTab('ad-details');
  };

  // Back from details
  const handleBackDetails = () => {
    popTab();
  };

  const handleEditAdRequest = (ad) => {
    setAdToEdit(ad);
    pushTab('dashboard');
  };

  // Navigate to Office Profile
  const handleOfficeClick = (officeId, service = 'الكل') => {
    setSelectedOfficeId(officeId);
    setSelectedOfficeService(service);
    pushTab('office-profile');
  };

  // Back from office profile
  const handleBackOfficeProfile = () => {
    popTab();
  };

  // Universal “back” (رجوع للخلف) inside the app
  const handleAppBack = () => {
    popTab();
  };

  const handleHomeClick = () => {
    setActiveCategory('الكل');
    setSelectedCity('الكل');
    if (activeTab !== 'home') pushTab('home');
  };

  const handleLoginSuccess = (user) => {
    setOfficeUser(user);
    setIsLoggedIn(true);
    if (user.role === 'admin') {
      pushTab('admin-dashboard');
    } else {
      pushTab('dashboard');
    }
  };

  const handleLogout = () => {
    setOfficeUser(null);
    setIsLoggedIn(false);
    pushTab('home');
  };

  const requestCitySelection = (afterSelectedCity) => {
    if (selectedCity !== 'الكل') {
      if (typeof afterSelectedCity === 'function') afterSelectedCity();
      return;
    }
    if (typeof afterSelectedCity === 'function') {
      pendingActionRef.current = afterSelectedCity;
    }
    setIsCityPickerOpen(true);
  };

  const handleCitySelected = (city) => {
    setSelectedCity(city);
    setIsCityPickerOpen(false);
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }
  };

  const handleCityPickerClose = () => {
    setIsCityPickerOpen(false);
    pendingActionRef.current = null;
  };

  // Page Renderer Helper
  const renderPageContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home 
            onAdDetailClick={handleAdDetailClick}
            onOfficeClick={handleOfficeClick}
            onShowAllAds={() => pushTab('all-ads')}
            onShowAllOffices={() => pushTab('all-offices')}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
          />
        );
      
      case 'search':
        return (
          <div style={{ padding: '72px 20px 0', width: '100%', minWidth: 0, overflowX: 'hidden' }}>
            <SearchTabContent 
              onAdDetailClick={handleAdDetailClick}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
            />
          </div>
        );

      case 'all-ads':
        return (
          <AllAds 
            onBackClick={() => popTab()}
            onAdDetailClick={handleAdDetailClick}
            activeCategory={activeCategory}
            selectedCity={selectedCity}
          />
        );

      case 'all-offices':
        return (
          <AllOffices 
            onBackClick={() => popTab()}
            onOfficeClick={handleOfficeClick}
            selectedCity={selectedCity}
          />
        );

      case 'favorites':
        return (
          <div style={{ padding: '20px 16px 30px', width: '100%', minWidth: 0, overflowX: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <button
                onClick={() => popTab()}
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
                الإعلانات المفضلة
              </h2>
            </div>
            {loadingFavorites ? (
              <div className="loader-spinner" />
            ) : favoriteAds.length === 0 ? (
              <div className="empty-state-wrapper">
                <div className="empty-state-icon">
                  <Heart size={32} />
                </div>
                <h3 className="empty-state-title">قائمتك المفضلة فارغة</h3>
                <p className="empty-state-desc">تصفح الإعلانات والخدمات في الصفحة الرئيسية واضغط على أيقونة القلب لحفظها هنا للرجوع إليها لاحقاً.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {favoriteAds.map((ad) => (
                  <div key={ad.id} style={{ minWidth: 'auto', width: '100%' }} className="ad-card-container-fav">
                    <AdCard 
                      ad={ad} 
                      onDetailClick={handleAdDetailClick}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'login':
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onBackHome={() => setActiveTab('home')}
          />
        );

      case 'dashboard':
        return (
          <Dashboard 
            officeUser={officeUser}
            onLogout={handleLogout}
            onUpdateProfile={(updatedUser) => setOfficeUser(updatedUser)}
            initialAddMode={!!adToEdit}
            adToEdit={adToEdit}
            clearAdToEdit={() => setAdToEdit(null)}
          />
        );

      case 'dashboard-add':
        return (
          <Dashboard 
            officeUser={officeUser}
            onLogout={handleLogout}
            onUpdateProfile={(updatedUser) => setOfficeUser(updatedUser)}
            initialAddMode={true}
            adToEdit={null}
            clearAdToEdit={() => setAdToEdit(null)}
          />
        );

      case 'admin-dashboard':
        return (
          <AdminDashboard 
            adminUser={officeUser}
            onLogout={handleLogout}
            onAdDetailClick={handleAdDetailClick}
            onOfficeClick={handleOfficeClick}
          />
        );

      case 'office-profile':
        return (
          <OfficeProfile
            key={selectedOfficeId}
            officeId={selectedOfficeId}
            onBackClick={handleBackOfficeProfile}
            officeUser={officeUser}
            onEditAd={handleEditAdRequest}
            onAdDetailClick={(id) => {
              setSelectedAdId(id);
              pushTab('ad-details');
            }}
            initialService={selectedOfficeService}
          />
        );

      case 'ad-details':
        return (
          <AdDetails 
            adId={selectedAdId}
            onBackClick={handleBackDetails}
            officeUser={officeUser}
            onEditAd={handleEditAdRequest}
            onOfficeClick={handleOfficeClick}
          />
        );

      default:
        return (
          <Home 
            onAdDetailClick={handleAdDetailClick}
            onOfficeClick={handleOfficeClick}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {/* Scrollable page content */}
      <div className="app-content">
        <React.Suspense fallback={<div className="loader-spinner" style={{ margin: 'auto', marginTop: '50px' }} />}>
          {renderPageContent()}
        </React.Suspense>
      </div>

      {/** Side navigation removed (kept BottomNav + full-screen details) */}

      {/* 4. Glassmorphism Bottom Tab Bar Navigation (Hidden on details page to give full screen experience) */}
      {activeTab !== 'ad-details' && activeTab !== 'office-profile' && activeTab !== 'admin-dashboard' && (
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            if (tab !== activeTab) {
              pushTab(tab);
            }
          }} 
          isLoggedIn={isLoggedIn}
          onHomeClick={handleHomeClick}
        />
      )}

    </div>
  );
}

// Subcomponent: Dedicated Search Tab View
function SearchTabContent({ onAdDetailClick, activeCategory, setActiveCategory, selectedCity, setSelectedCity }) {
  const [localQuery, setLocalQuery] = useState('');
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const list = await dataService.getProvinces();
      setProvinces(list);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchFiltered = async () => {
      if (filteredAds.length === 0) setLoading(true);
      try {
        const adsList = await dataService.getAds({
          category: activeCategory,
          city: selectedCity,
          searchQuery: localQuery
        });
        setFilteredAds(adsList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchFiltered, 400);
    return () => clearTimeout(timer);
  }, [activeCategory, selectedCity, localQuery]);

  return (
    <div style={{ paddingBottom: '30px' }}>
      <div className="section-title-wrapper" style={{ margin: '16px 0' }}>
        <h2 className="section-title">البحث المتقدم</h2>
      </div>

      {/* Search Bar Input */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن مكاتب، مواصلات، أسعار..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          <Search className="search-icon" size={18} />
        </div>
      </div>

      {/* Select Category Row */}
      <div style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>تصفية حسب نوع الخدمة:</span>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '6px 0' }}>
          {['الكل', 'عمرة', 'تذاكر طيران', 'زيارات عائلية', 'تأشيرات', 'رحلة سفر', 'شحن'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: activeCategory === cat ? 'var(--primary)' : 'var(--card-bg)',
                color: activeCategory === cat ? 'var(--text-white)' : 'var(--text-main)',
                fontWeight: '700',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Select City Row */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>تصفية حسب المدينة:</span>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '6px 0' }}>
          {provinces.map((city) => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city);
                setActiveCategory('الكل');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: selectedCity === city ? 'var(--accent)' : 'var(--card-bg)',
                color: selectedCity === city ? 'var(--primary)' : 'var(--text-main)',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)'
              }}
            >
              {city === "الكل" ? "المحافظة" : city}
            </button>
          ))}
        </div>
      </div>

      {/* Results Listing */}
      <div className="section-title-wrapper" style={{ margin: '10px 0' }}>
        <h3 className="section-title" style={{ fontSize: '13px' }}>نتائج البحث ({filteredAds.length})</h3>
      </div>

      {loading ? (
        <div className="loader-spinner" />
      ) : filteredAds.length === 0 ? (
        <div className="empty-state-wrapper">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">لا توجد نتائج مطابقة</h3>
          <p className="empty-state-desc">حاول تعديل كلمات البحث أو إلغاء تصفية الخدمات والمدن.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {filteredAds.map((ad) => (
            <div key={ad.id} style={{ minWidth: 'auto', width: '100%' }}>
              <AdCard 
                ad={ad} 
                onDetailClick={onAdDetailClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
