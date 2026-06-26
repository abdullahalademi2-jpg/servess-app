import React from 'react';
import { Home, Search, Heart, User, Plus, LogOut } from 'lucide-react';

export default function SideNav({ activeTab, setActiveTab, isLoggedIn }) {
  const handleTabClick = (tabId) => {
    if (tabId === 'add') {
      if (isLoggedIn) setActiveTab('dashboard-add');
      else setActiveTab('login');
      return;
    }

    if (tabId === 'account') {
      setActiveTab(isLoggedIn ? 'dashboard' : 'login');
      return;
    }

    setActiveTab(tabId);
  };

  const isActive = (tabId) => {
    if (tabId === 'account') return ['login', 'dashboard', 'dashboard-add'].includes(activeTab);
    return activeTab === tabId;
  };

  return (
    <div className="side-nav-container" dir="rtl">
      <button
        className={`side-nav-item ${isActive('home') ? 'active' : ''}`}
        onClick={() => handleTabClick('home')}
        aria-label="الرئيسية"
      >
        <Home size={20} />
        <span>الرئيسية</span>
      </button>

      <button
        className={`side-nav-item ${isActive('search') ? 'active' : ''}`}
        onClick={() => handleTabClick('search')}
        aria-label="البحث"
      >
        <Search size={20} />
        <span>البحث</span>
      </button>

      <button
        className={`side-nav-item ${isActive('favorites') ? 'active' : ''}`}
        onClick={() => handleTabClick('favorites')}
        aria-label="المفضلة"
      >
        <Heart size={20} />
        <span>المفضلة</span>
      </button>

      <button
        className={`side-nav-item side-nav-item-plus ${isActive('add') ? 'active' : ''}`}
        onClick={() => handleTabClick('add')}
        aria-label="إضافة إعلان جديد"
      >
        <Plus size={20} />
        <span>إضافة</span>
      </button>

      <button
        className={`side-nav-item ${isActive('account') ? 'active' : ''}`}
        onClick={() => handleTabClick('account')}
        aria-label="حسابي"
      >
        <User size={20} />
        <span>حسابي</span>
      </button>
    </div>
  );
}

