import React from 'react';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, isLoggedIn, onHomeClick }) {

  const handleTabClick = (tabId) => {
    if (tabId === 'home') {
      if (onHomeClick) onHomeClick();
      else setActiveTab('home');
    } else if (tabId === 'add') {
      if (isLoggedIn) {
        setActiveTab('dashboard-add'); // Open dashboard in add mode
      } else {
        setActiveTab('login'); // Require login to post ads
      }
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="bottom-nav-container">

      {/* 1. Home */}
      <button 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => handleTabClick('home')}
        style={{ background: 'none', border: 'none' }}
      >
        <div className="nav-icon-wrapper">
          <Home size={22} />
        </div>
        <span>الرئيسية</span>
      </button>

      {/* 2. Search */}
      <button 
        className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => handleTabClick('search')}
        style={{ background: 'none', border: 'none' }}
      >
        <div className="nav-icon-wrapper">
          <Search size={22} />
        </div>
        <span>البحث</span>
      </button>

      {/* 3. Center Elevated Plus Button */}
      <div className="nav-item-center">
        <button 
          className="btn-center-plus" 
          onClick={() => handleTabClick('add')}
          aria-label="إضافة إعلان جديد"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
        <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)', marginTop: '24px', position: 'absolute', bottom: '6px' }}>أضف إعلان</span>
      </div>

      {/* 4. Favorites */}
      <button 
        className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
        onClick={() => handleTabClick('favorites')}
        style={{ background: 'none', border: 'none' }}
      >
        <div className="nav-icon-wrapper">
          <Heart size={22} />
        </div>
        <span>المفضلة</span>
      </button>

      {/* 5. My Account */}
      <button 
        className={`nav-item ${['login', 'dashboard', 'dashboard-add'].includes(activeTab) ? 'active' : ''}`}
        onClick={() => handleTabClick(isLoggedIn ? 'dashboard' : 'login')}
        style={{ background: 'none', border: 'none' }}
      >
        <div className="nav-icon-wrapper">
          <User size={22} />
        </div>
        <span>حسابي</span>
      </button>
    </div>
  );
}
