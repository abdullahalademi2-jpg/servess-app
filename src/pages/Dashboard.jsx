import React, { useEffect, useState } from 'react';
import { LogOut, Plus, Trash2, ArrowRight, Save, MapPin, Image as ImageIcon, Upload, Edit2, ShieldAlert } from 'lucide-react';
import { dataService } from '../services/dataService';


export default function Dashboard({ officeUser, onLogout, onUpdateProfile = () => {}, initialAddMode = false, adToEdit = null, clearAdToEdit = () => {} }) {
  const [ads, setAds] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(initialAddMode && officeUser.status !== 'pending');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Edit State
  const [profName, setProfName] = useState(officeUser.name || '');
  const [profPhone, setProfPhone] = useState(officeUser.phone || '');
  const [profCity, setProfCity] = useState(officeUser.city || 'صنعاء');
  const [profDescription, setProfDescription] = useState(officeUser.description || '');
  const [profLogoFile, setProfLogoFile] = useState(null);
  const [profLogoPreview, setProfLogoPreview] = useState(officeUser.logo || '');
  const [profLoading, setProfLoading] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      const list = await dataService.getProvinces();
      setProvinces(list.filter(p => p !== 'الكل'));
    };
    fetchProvinces();
  }, []);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('عمرة');
  const [city, setCity] = useState(officeUser.city || 'صنعاء');
  const [street, setStreet] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [isSevenStars, setIsSevenStars] = useState(false);
  const [description, setDescription] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingAdId, setEditingAdId] = useState(null);
  
  // Transport / Flight specific fields
  const [transportDate, setTransportDate] = useState('');
  const [transportTime, setTransportTime] = useState('');
  const [transportCompany, setTransportCompany] = useState('');
  const [busType, setBusType] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');

  const [liveStats, setLiveStats] = useState({ views: officeUser.views || 0, rating: officeUser.rating || 0 });

  // City dropdown toggle
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleAddNew = () => {
    setEditingAdId(null);
    setTitle('');
    setCategory('عمرة');
    setCity(officeUser.city || 'صنعاء');
    setStreet('');
    setPrice('');
    setPhone('');
    setIsSevenStars(false);
    setDescription('');
    setImageFile(null);
    setImagePreviewUrl('');
    setTransportDate('');
    setTransportTime('');
    setTransportCompany('');
    setBusType('');
    setDepartureCity('');
    setArrivalCity('');
    setShowCityDropdown(false);
    setIsAdding(true);
  };

  const handleEditAd = (ad) => {
    setEditingAdId(ad.id);
    setTitle(ad.title || '');
    setCategory(ad.category || 'عمرة');
    setCity(ad.city || officeUser.city || 'صنعاء');
    setStreet(ad.street || '');
    setPrice(ad.price || '');
    setPhone(ad.phone || '');
    setDescription(ad.description || '');
    setIsSevenStars(ad.highlights === "فندق 7 نجوم");
    setImagePreviewUrl(ad.image || '');
    setTransportDate(ad.transportDate || '');
    setTransportTime(ad.transportTime || '');
    setTransportCompany(ad.transportCompany || '');
    setBusType(ad.busType || '');
    setDepartureCity(ad.departureCity || '');
    setArrivalCity(ad.arrivalCity || '');
    setShowCityDropdown(false);
    setIsAdding(true);
  };

  // Sync mode if changed from parent
  useEffect(() => {
    setIsAdding(initialAddMode && officeUser.status === 'active');
  }, [initialAddMode, officeUser.status]);

  useEffect(() => {
    if (adToEdit) {
      handleEditAd(adToEdit);
      clearAdToEdit();
    }
  }, [adToEdit]);

  const loadOfficeAds = async () => {
    setLoading(true);
    try {
      const officeAds = await dataService.getAds({ officeId: (officeUser.uid || officeUser.id) });
      setAds(officeAds);
      // Fetch latest stats
      const officeData = await dataService.getOfficeById(officeUser.uid || officeUser.id);
      if (officeData) {
        setLiveStats({ views: officeData.views || 0, rating: officeData.rating || 0 });
      }
    } catch (err) {
      console.error("خطأ في جلب إعلانات المكتب:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficeAds();
  }, [officeUser.uid, officeUser.id]);

  const handleDeleteAd = async (id) => {
    if (await window.appConfirm("هل أنت متأكد من رغبتك في حذف هذا الإعلان؟")) {
      try {
        await dataService.deleteAd(id);
        loadOfficeAds();
        alert("تم حذف الإعلان بنجاح!");
      } catch (err) {
        alert("حدث خطأ أثناء حذف الإعلان.");
      }
    }
  };

  // Helper to get matching image if user doesn't specify one
  const getDefaultImageByCategory = (cat) => {
    switch(cat) {
      case 'عمرة': return "https://images.unsplash.com/photo-1565552110934-2f3b8d0a3e0b?auto=format&fit=crop&w=800&q=80";
      case 'حج': return "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80";
      case 'تأشيرات': return "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80";
      case 'نقل': return "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80";
      case 'شحن': return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80";
      case 'تذاكر طيران': return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80";
      default: return "https://images.unsplash.com/photo-1565552110934-2f3b8d0a3e0b?auto=format&fit=crop&w=800&q=80";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (officeUser.status !== 'active') {
      alert("لا يمكنك نشر الإعلانات حالياً. حسابك غير فعال أو موقوف.");
      return;
    }
    setFormLoading(true);

    try {
      // الرفع إلى Firebase Storage إذا كان هناك ملف
      let imageUrl = imagePreviewUrl || getDefaultImageByCategory(category);
      if (imageFile) {
        const path = `ads/${Date.now()}_${imageFile.name}`;
        imageUrl = await dataService.uploadFile(imageFile, path);
      }

      // Generate title automatically from category
      const finalTitle = category === 'عمرة' ? 'رحلة عمرة مميزة' : `خدمات ${category}`;

      const finalHighlights = isSevenStars 
        ? "فندق 7 نجوم" 
        : "";

      const adData = {
        title: finalTitle || "",
        category: category || "",
        city: city || "",
        street: street || "",
        price: Number(price) || 0,
        phone: officeUser.phone || "",
        description: description || "",
        highlights: finalHighlights || "",
        image: imageUrl || "",
        officeId: (officeUser.uid || officeUser.id) || "",
        officeName: officeUser.name || "",
        ...((['رحلات سفر', 'تذاكر طيران', 'نقل', 'عمرة'].includes(category)) ? { 
          transportDate: transportDate || "", 
          transportTime: transportTime || "", 
          transportCompany: transportCompany || "", 
          busType: busType || "", 
          departureCity: departureCity || "", 
          arrivalCity: arrivalCity || "" 
        } : {})
      };

      if (editingAdId) {
        await dataService.updateAd(editingAdId, adData);
      } else {
        await dataService.addAd(adData);
      }

      // Clear form
      setTitle('');
      setCategory('عمرة');
      setCity(officeUser.city || 'صنعاء');
      setStreet('');
      setPrice('');
      setPhone('');
      setIsSevenStars(false);
      setDescription('');
      setImageFile(null);
      setImagePreviewUrl('');
      setTransportDate('');
      setTransportTime('');
      setTransportCompany('');
      setBusType('');
      setDepartureCity('');
      setArrivalCity('');
      setEditingAdId(null);

      setIsAdding(false);
      loadOfficeAds();
      setToastMsg(editingAdId ? "تم تعديل الإعلان بنجاح!" : "تم نشر الاعلان");
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert("خطأ في إضافة الإعلان: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };


  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setProfLoading(true);
    try {
      let finalLogo = profLogoPreview;
      if (profLogoFile) {
        // رفع الشعار إلى Firebase Storage
        const path = `offices/${Date.now()}_${profLogoFile.name}`;
        finalLogo = await dataService.uploadFile(profLogoFile, path);
      }
      
      const updatedProfile = {
        name: profName || "",
        phone: profPhone || "",
        city: profCity || "",
        description: profDescription || "",
        logo: finalLogo || ""
      };
      
      const newData = await dataService.updateOfficeProfile(officeUser.uid || officeUser.id, updatedProfile);
      onUpdateProfile(newData); // update App state
      alert("تم تحديث بيانات المكتب بنجاح!");
      setIsEditingProfile(false);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ البيانات: " + err.message);
    } finally {
      setProfLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (await window.appConfirm("تحذير خطير: هل أنت متأكد من رغبتك في حذف حسابك؟ سيتم حذف جميع بياناتك وإعلاناتك بشكل نهائي ولن تتمكن من استرجاعها!")) {
      try {
        setProfLoading(true);
        await dataService.deleteOffice(officeUser.uid || officeUser.id);
        alert("تم حذف حسابك وجميع إعلاناتك بنجاح.");
        onLogout();
      } catch (err) {
        alert("حدث خطأ أثناء حذف الحساب: " + err.message);
        setProfLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '14px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          pointerEvents: 'none'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Top Bar for Back/Logout and Edit Profile */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0 16px' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid rgba(10, 24, 40, 0.08)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <ArrowRight size={16} />
          <span>تسجيل خروج</span>
        </button>

        {!isEditingProfile && (
          <button
            onClick={() => {
              setIsAdding(false);
              setIsEditingProfile(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--primary)',
              color: '#000000',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
            }}
          >
            <Edit2 size={14} />
            <span>تعديل البروفايل</span>
          </button>
        )}
      </div>

      {/* Stats Dashboard Widget */}
      <div className="dashboard-stats-grid" style={{ marginTop: '16px' }}>
        <div className="dashboard-stat-card">
          <div style={{ fontSize: '13px', marginBottom: '1px' }}>📢</div>
          <span className="stat-val">{ads.length}</span>
          <span className="stat-lbl">إعلانات نشطة</span>
        </div>
        <div className="dashboard-stat-card">
          <div style={{ fontSize: '13px', marginBottom: '1px' }}>👁️</div>
          <span className="stat-val">{liveStats.views}</span>
          <span className="stat-lbl">مشاهدات</span>
        </div>
        <div className="dashboard-stat-card">
          <div style={{ fontSize: '13px', marginBottom: '1px' }}>⭐</div>
          <span className="stat-val">{liveStats.rating}</span>
          <span className="stat-lbl">التقييم</span>
        </div>
      </div>


      {officeUser.status === 'pending' && (
        <div className="pending-alert-banner">
          <ShieldAlert size={20} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800' }}>حسابك قيد المراجعة</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', lineHeight: '1.4' }}>
              أهلاً بك! حساب مكتبك قيد المراجعة حالياً من قبل الإدارة، ولا يمكنك نشر الإعلانات أو الخدمات حتى يتم تفعيله.
            </p>
          </div>
        </div>
      )}

      {officeUser.status === 'suspended' && (
        <div className="pending-alert-banner" style={{ background: 'rgba(220, 38, 38, 0.05)', color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.2)' }}>
          <ShieldAlert size={20} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800' }}>حسابك موقوف مؤقتاً</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', lineHeight: '1.4' }}>
              عذراً، تم إيقاف حسابك من قبل الإدارة مؤقتاً ولن تتمكن من إضافة إعلانات جديدة حالياً. لمزيد من التفاصيل يرجى التواصل مع الدعم.
            </p>
          </div>
        </div>
      )}

      {/* 3. Panel Switch - Add Ad Form or List of Ads or Edit Profile */}
      <div style={{ padding: '0 16px', flex: '1', display: 'flex', flexDirection: 'column' }}>
        
        {isEditingProfile ? (
          /* EDIT PROFILE VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="back-btn-row">
              <button className="btn-back-text" onClick={() => setIsEditingProfile(false)}>
                <ArrowRight size={16} />
                <span>إلغاء والتراجع</span>
              </button>
            </div>
            
            <h3 className="dashboard-sec-title">تعديل بيانات المكتب</h3>
            
            <form className="login-form" onSubmit={handleEditProfileSubmit} style={{ margin: '10px 0 30px 0' }}>
              <div className="form-group">
                <label className="form-label">اسم المكتب</label>
                <input
                  type="text"
                  className="form-input"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">المدينة</label>
                <select className="form-input" value={profCity} onChange={(e) => setProfCity(e.target.value)}>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">رقم الهاتف للتواصل</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="مثال: 777123456"
                  value={profPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 9) setProfPhone(val);
                  }}
                  required
                  pattern="^7[0-9]{8}$"
                  maxLength={9}
                  title="رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 9 أرقام"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">نبذة عن المكتب</label>
                <textarea
                  className="form-input"
                  value={profDescription}
                  onChange={(e) => setProfDescription(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">شعار المكتب (اللوجو)</label>
                <div className="form-input-wrapper" style={{ alignItems: 'stretch', gap: 10 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setProfLogoFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setProfLogoPreview(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="form-input"
                    style={{ paddingTop: 12, paddingBottom: 12 }}
                  />
                  <Upload size={18} className="form-input-icon" />
                </div>
                {profLogoPreview && (
                  <div style={{ marginTop: 10, textAlign: 'center' }}>
                    <img
                      src={profLogoPreview}
                      alt="preview"
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--primary)' }}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="login-btn" disabled={profLoading} style={{ marginTop: '20px' }}>
                {profLoading ? (
                  <span className="loader-spinner" style={{ margin: 0, width: 16, height: 16, borderTopColor: 'var(--primary)' }} />
                ) : (
                  <>
                    <Save size={16} />
                    <span>حفظ التعديلات</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                onClick={handleDeleteAccount}
                disabled={profLoading} 
                style={{ 
                  marginTop: '12px', 
                  marginBottom: '100px', 
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Trash2 size={16} />
                <span>حذف الحساب نهائياً</span>
              </button>
            </form>
          </div>
        ) : isAdding ? (
          /* ADD NEW AD VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="back-btn-row">
              <button 
                onClick={() => setIsAdding(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px',
                  background: 'var(--card-bg)', color: 'var(--text-main)',
                  border: '1px solid rgba(10, 24, 40, 0.08)', borderRadius: '50%',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s'
                }}
              >
                <ArrowRight size={20} />
              </button>
            </div>
            
            <h3 className="dashboard-sec-title">{editingAdId ? "تعديل الإعلان" : "أضف إعلان خدمة جديد"}</h3>
            
            <form className="login-form" onSubmit={handleSubmit} style={{ margin: '10px 0 30px 0' }}>
              {/* Category row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <div className="form-group" style={{ position: 'relative', zIndex: showCategoryDropdown ? 100 : 2 }}>
                  <label className="form-label">نوع الخدمة</label>
                  
                  {/* Category Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(v => !v)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid ' + (showCategoryDropdown ? 'var(--primary)' : 'rgba(10,24,40,0.12)'),
                      background: 'var(--card-bg)',
                      color: 'var(--text)',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      height: '45px'
                    }}
                  >
                    <span>{category === 'تذاكر طيران' ? '✈️ ' : category === 'عمرة' ? '🕋 ' : category === 'رحلات سفر' ? '🚌 ' : '✨ '}{category}</span>
                    <span style={{ fontSize: '10px', transition: 'transform 0.2s', transform: showCategoryDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                  </button>

                  {/* Category Dropdown list */}
                  {showCategoryDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 0,
                      left: 0,
                      zIndex: 50,
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid rgba(37,99,235,0.2)',
                      boxShadow: '0 8px 24px rgba(10,24,40,0.12)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                    }}>
                      {['عمرة', 'تذاكر طيران', 'زيارات عائلية', 'تأشيرات', 'رحلات سفر', 'شحن'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            setShowCategoryDropdown(false);
                          }}
                          style={{
                            padding: '10px 12px',
                            textAlign: 'right',
                            background: category === cat ? 'rgba(37,99,235,0.08)' : 'transparent',
                            color: category === cat ? 'var(--primary)' : 'var(--text-main)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: category === cat ? '700' : '500',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>


              </div>

              {/* Street */}
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label" htmlFor="street-input">الشارع / المنطقة</label>
                <input
                  id="street-input"
                  type="text"
                  className="form-input"
                  placeholder="مثال: شارع الرياض، حي النزهة..."
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  style={{ paddingRight: '14px', height: '45px' }}
                />
              </div>

              {/* Transport / Flight / Umrah specific fields */}
              {(['رحلات سفر', 'تذاكر طيران', 'نقل', 'عمرة'].includes(category)) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', background: 'rgba(37,99,235,0.04)', borderRadius: '14px', border: '1.5px solid rgba(37,99,235,0.12)', width: '100%', margin: '0 auto' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', marginBottom: '2px' }}>
                    {category === 'تذاكر طيران' ? '✈️ تفاصيل رحلة الطيران' : category === 'عمرة' ? '🕋 تفاصيل رحلة العمرة / التفويج' : '🚌 تفاصيل الرحلة البرية'}
                  </div>

                  {/* Date & Time row */}
                  <div style={{ display: 'grid', gridTemplateColumns: category === 'عمرة' ? '1fr' : '1fr 1fr', gap: '10px', alignItems: 'end' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="transport-date-input" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{category === 'عمرة' ? 'تاريخ التفويج *' : 'تاريخ الرحلة *'}</label>
                      <input
                        id="transport-date-input"
                        type="date"
                        className="form-input"
                        value={transportDate}
                        onChange={(e) => setTransportDate(e.target.value)}
                        style={{ paddingRight: '10px', paddingLeft: '10px', height: '38px', minHeight: '38px' }}
                        required
                      />
                    </div>

                    {category !== 'عمرة' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="transport-time-input" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>وقت الانطلاق *</label>
                        <input
                          id="transport-time-input"
                          type="time"
                          className="form-input"
                          value={transportTime}
                          onChange={(e) => setTransportTime(e.target.value)}
                          style={{ paddingRight: '10px', paddingLeft: '10px', height: '38px', minHeight: '38px' }}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {category !== 'عمرة' && (
                    <>
                      {/* Departure & Arrival Cities */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="departure-city-input" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>محافظة / مدينة الانطلاق *</label>
                      <input
                        id="departure-city-input"
                        type="text"
                        className="form-input"
                        placeholder="مثال: صنعاء، عدن..."
                        value={departureCity}
                        onChange={(e) => setDepartureCity(e.target.value)}
                        style={{ paddingRight: '10px', height: '38px', minHeight: '38px' }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="arrival-city-input" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>محافظة / مدينة الوصول *</label>
                      <input
                        id="arrival-city-input"
                        type="text"
                        className="form-input"
                        placeholder="مثال: الرياض، القاهرة..."
                        value={arrivalCity}
                        onChange={(e) => setArrivalCity(e.target.value)}
                        style={{ paddingRight: '10px', height: '38px', minHeight: '38px' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Company & Bus/Aircraft Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', alignItems: 'end' }}>
                    {category !== 'رحلات سفر' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="transport-company-input" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {category === 'تذاكر طيران' ? 'شركة الطيران *' : 'الشركة الناقلة *'}
                        </label>
                        <input
                          id="transport-company-input"
                          type="text"
                          className="form-input"
                          placeholder={category === 'تذاكر طيران' ? 'مثال: يمنية، فلاي دبي...' : 'مثال: شركة النقل الجماعي'}
                          value={transportCompany}
                          onChange={(e) => setTransportCompany(e.target.value)}
                          style={{ paddingRight: '16px', height: '38px', minHeight: '38px' }}
                          required
                        />
                      </div>
                    )}
                    {category === 'رحلات سفر' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="bus-type-input" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          نوع / موديل الباص (اختياري)
                        </label>
                        <input
                          id="bus-type-input"
                          type="text"
                          className="form-input"
                          placeholder="مثال: المتصدر، هيونداي، MAN..."
                          value={busType}
                          onChange={(e) => setBusType(e.target.value)}
                          style={{ paddingRight: '16px', height: '38px', minHeight: '38px' }}
                        />
                      </div>
                    )}
                  </div>
                  </>
                )}
              </div>
            )}

              {/* Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', maxWidth: '150px', alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="price-input">السعر (ر.س)</label>
                  <input
                    id="price-input"
                    type="number"
                    className="form-input"
                    placeholder="مثال: 850"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ paddingRight: '16px', height: '36px', minHeight: '36px' }}
                    required
                  />
                </div>
              </div>

              {/* Image Picker (from device) */}
              <div className="form-group">
                <label className="form-label" htmlFor="image-picker">صورة الإعلان (إلزامي) *</label>

                <div
                  className="form-input-wrapper"
                  style={{ alignItems: 'stretch', gap: 10 }}
                >
                  <input
                    id="image-picker"
                    type="file"
                    accept="image/*"
                    required={!editingAdId && !imagePreviewUrl}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setImageFile(null);
                        setImagePreviewUrl('');
                        return;
                      }
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreviewUrl(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="form-input"
                    style={{ paddingTop: 12, paddingBottom: 12 }}
                  />

                  <Upload size={18} className="form-input-icon" />
                </div>

                {imagePreviewUrl && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={imagePreviewUrl}
                      alt="preview"
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(10,24,40,0.06)' }}
                    />
                  </div>
                )}
              </div>



              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="desc-input">وصف الإعلان والتفاصيل</label>
                <textarea
                  id="desc-input"
                  className="form-input"
                  placeholder="اكتب وصفاً تفصيلياً للبرنامج أو الخدمة المقدمة..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '80px', paddingRight: '16px', paddingTop: '10px', resize: 'vertical' }}
                  required
                />
              </div>
              {/* 7 Stars Hotel Checkbox Feature */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(212,175,55,0.06)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }} onClick={() => setIsSevenStars(!isSevenStars)}>
                <input 
                  type="checkbox" 
                  checked={isSevenStars}
                  onChange={(e) => setIsSevenStars(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>ميزة فندق 7 نجوم 🌟</span>
              </div>


              <button type="submit" className="login-btn" disabled={formLoading} style={{ marginTop: '20px', marginBottom: '100px' }}>
                {formLoading ? (
                  <span className="loader-spinner" style={{ margin: 0, width: 16, height: 16, borderTopColor: 'var(--primary)' }} />
                ) : (
                  <>
                    <Save size={16} />
                    <span>حفظ ونشر الإعلان</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* MY ADS LIST VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
            <div className="dashboard-actions-panel">
              <h3 className="dashboard-sec-title">إعلانات المكتب الحالية</h3>
              {officeUser.status === 'active' && (
                <button className="btn-add-new-ad" onClick={handleAddNew}>
                  <Plus size={14} />
                  <span>أضف جديد</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="loader-spinner" />
            ) : ads.length === 0 ? (
              <div className="empty-state-wrapper" style={{ margin: 'auto' }}>
                <div className="empty-state-icon">📝</div>
                <h3 className="empty-state-title">لا توجد إعلانات منشورة</h3>
                <p className="empty-state-desc">لم تقم بإضافة أي إعلانات خدمات بعد. انقر على "أضف جديد" لنشر أول عروضك!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '420px', paddingBottom: '20px' }}>
                {ads.map((ad) => (
                  <div key={ad.id} className="my-ad-row-card">
                    <img src={ad.image} alt={ad.title} className="my-ad-img" loading="lazy" />
                    <div className="my-ad-info">
                      <h4 className="my-ad-title">{ad.title}</h4>
                      
                      <div className="my-ad-footer-row">
                        <span className="my-ad-price">{ad.price} <span style={{ fontSize: '9px', fontWeight: '500', color: 'var(--text-muted)' }}>ر.س</span></span>
                        
                        <div className="my-ad-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleEditAd(ad)}
                            title="تعديل الإعلان"
                            style={{ backgroundColor: '#2563eb', border: 'none', color: '#ffffff', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn-delete-ad"
                            onClick={() => handleDeleteAd(ad.id)}
                            title="حذف الإعلان"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
