import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, onFilterClick, activeCategory = 'الكل' }) {
  const getPlaceholder = () => {
    if (activeCategory === 'الكل') return "ابحث عن خدمة، مكتب، أو مدينة...";
    if (activeCategory === 'عمرة') return "ابحث عن رحلات العمرة، الفنادق...";
    if (activeCategory === 'تذاكر طيران') return "ابحث عن رحلات طيران، وجهات...";
    return `ابحث في خدمات ${activeCategory}...`;
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={getPlaceholder()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-btn" type="button" aria-label="بحث">
          <Search size={18} />
        </button>
        <button 
          className="filter-btn" 
          onClick={onFilterClick}
          aria-label="تصفية متقدمة"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
