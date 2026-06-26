import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldAlert, User, MapPin, Phone, UserPlus, Eye, EyeOff } from 'lucide-react';
import { dataService } from '../services/dataService';

export default function Login({ onLoginSuccess, onBackHome }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form Fields
  const [email, setEmail] = useState(localStorage.getItem('office_saved_email') || '');
  const [password, setPassword] = useState(localStorage.getItem('office_saved_password') || '');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Removed lockout logic

    try {
      if (isLoginMode) {
        const officeUser = await dataService.loginOffice(email.trim(), password);
        
        // Reset failed attempts on success
        localStorage.setItem('failed_attempts', '0');
        localStorage.removeItem('lockout_until');
        localStorage.removeItem('lockout_level');

        localStorage.setItem('office_saved_email', email.trim());
        localStorage.setItem('office_saved_password', password);
        onLoginSuccess(officeUser);
      } else {
        const newOffice = await dataService.registerOffice({
          email,
          name,
          city,
          phone,
          password
        });
        // Auto login after registration
        const officeUser = await dataService.loginOffice(email, password);
        onLoginSuccess(officeUser);
      }
    } catch (err) {
      let errorMsg = err.message || "حدث خطأ يرجى التحقق من المدخلات.";
      if (errorMsg.includes('auth/email-already-in-use')) errorMsg = "هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول.";
      else if (errorMsg.includes('auth/weak-password')) errorMsg = "كلمة المرور ضعيفة، يجب أن تتكون من 6 أحرف أو أرقام على الأقل.";
      else if (errorMsg.includes('auth/invalid-credential')) errorMsg = "بيانات الدخول غير صحيحة، يرجى التأكد من الإيميل وكلمة المرور.";
      else if (errorMsg.includes('auth/invalid-email')) errorMsg = "صيغة البريد الإلكتروني غير صحيحة.";
      else if (errorMsg.includes('auth/network-request-failed')) errorMsg = "يوجد مشكلة في الاتصال بالإنترنت.";
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      
      {/* Back to Home Button */}
      <div style={{ padding: '20px 20px 0 20px', position: 'relative', zIndex: 1 }}>
        <button 
          onClick={onBackHome}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            background: 'var(--card-bg)', color: 'var(--text-main)',
            border: '1px solid rgba(10, 24, 40, 0.08)', borderRadius: '50%',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.2s', zIndex: 10
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M5 12l6-6M5 12l6 6"/></svg>
        </button>
      </div>

      {/* Header section */}
      <div className="login-header">
        <div className="login-logo-circle">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3b82f6" />
            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#93c5fd" />
            <path d="M12 12V22" stroke="#1e40af" strokeWidth="1.5" />
            <path d="M2 12H12" stroke="#1e40af" strokeWidth="1" />
            <path d="M12 12H22" stroke="#1e40af" strokeWidth="1" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <h2 className="login-title">{isLoginMode ? "مرحباً بك في منصة خدمات المكاتب" : "إنشاء حساب جديد"}</h2>
          <p className="login-subtitle">
            {isLoginMode ? "قم بتسجيل الدخول لإدارة إعلانات مكتبك" : "انضم إلينا الآن للوصول إلى آلاف العملاء المهتمين بالخدمات"}
          </p>
        </div>
      </div>

      {/* Form section */}
      <div style={{ padding: '0 16px', flex: '1' }}>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold' }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {!isLoginMode && (
            <>
              {/* Office Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name-input">اسم المكتب</label>
                <div className="form-input-wrapper">
                  <input
                    id="name-input"
                    type="text"
                    className="form-input"
                    placeholder="مثال: مكتب النور للخدمات"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLoginMode}
                  />
                  <User size={16} className="form-input-icon" />
                </div>
              </div>

              {/* City and Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="city-input">المدينة</label>
                  <div className="form-input-wrapper">
                    <input
                      id="city-input"
                      type="text"
                      className="form-input"
                      placeholder="صنعاء"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required={!isLoginMode}
                    />
                    <MapPin size={16} className="form-input-icon" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone-input">رقم الهاتف</label>
                  <div className="form-input-wrapper">
                    <input
                      id="phone-input"
                      type="tel"
                      className="form-input"
                      placeholder="مثال: 777123456"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 9) setPhone(val);
                      }}
                      required={!isLoginMode}
                      pattern="^7[0-9]{8}$"
                      maxLength={9}
                      title="رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 9 أرقام"
                      style={{ direction: 'ltr' }}
                    />
                    <Phone size={16} className="form-input-icon" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">البريد الإلكتروني للمكتب</label>
            <div className="form-input-wrapper">
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="office@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
              <Mail size={16} className="form-input-icon" />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password-input">كلمة المرور</label>
            <div className="form-input-wrapper">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder={isLoginMode ? "••••••••" : "اختر كلمة مرور (123456 للتجربة)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Lock size={16} className="form-input-icon" />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="loader-spinner" style={{ margin: 0, width: 16, height: 16, borderTopColor: 'var(--primary)' }} />
            ) : (
              <>
                {isLoginMode ? <LogIn size={16} /> : <UserPlus size={16} />}
                <span>{isLoginMode ? "موافق" : "إنشاء حساب"}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            {isLoginMode ? "ليس لديك حساب مكتب؟ " : "لديك حساب بالفعل؟ "}
          </span>
          <button 
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              marginLeft: '4px'
            }}
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
            }}
          >
            {isLoginMode ? "سجل الآن مجاناً" : "تسجيل الدخول"}
          </button>
        </div>


      </div>
    </div>
  );
}
