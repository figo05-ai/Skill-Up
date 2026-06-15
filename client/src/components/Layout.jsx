import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.jpeg';
import api from '../api/axios';

const Layout = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  // اجعل القائمة مغلقة افتراضياً إذا كانت الشاشة أصغر من 1024 بكسل (موبايل/تابلت)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const lastClickTimeRef = useRef(0);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const logVisit = async () => {
      if (!user) return;
      try {
        await api.post('/auth/log', {
          action: 'VISIT_PAGE',
          details: `Visited: ${location.pathname}`
        });
      } catch (e) { /* ignore */ }
    };
    logVisit();
  }, [location.pathname, user]);

  // تسجيل النقرات على الأزرار والروابط في كامل الموقع
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // البحث عن أقرب عنصر قابل للنقر (زر، رابط، أو حقل إرسال)
      const target = e.target.closest('button, a, input[type="submit"], input[type="button"]');
      
      if (target) {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 500) return; // منع التكرار لمدة 500 مللي ثانية
        lastClickTimeRef.current = now;

        let label = target.innerText || target.getAttribute('aria-label') || target.title || '';
        if (!label && target.querySelector('svg')) label = 'Icon'; // للأزرار التي تحتوي أيقونات فقط
        label = label.replace(/\s+/g, ' ').trim().substring(0, 50); // تنظيف النص
        
        api.post('/auth/log', {
          action: 'UI_CLICK',
          details: `Clicked <${target.tagName.toLowerCase()}> ${label ? `"${label}"` : ''} on ${location.pathname}`
        }).catch(() => {});
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [location.pathname]);

  const NavItem = ({ to, icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 mb-1 ${
        isActive(to)
          ? 'bg-emerald-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );

  const SectionLabel = ({ label }) => (
    <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
      {label}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-0'
        } bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 flex flex-col h-full z-20 no-print overflow-hidden`}
      >
        <div className="h-32 flex items-center justify-center border-b border-gray-100 px-6">
          <img src={logo} alt="Skillup" className="h-28 object-contain" />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <NavItem to="/dashboard" icon="📊" label={t('dashboard')} />
          
          <SectionLabel label={t('hr')} />
          <NavItem to="/employees" icon="👥" label={t('employees')} />
          <NavItem to="/remote-workers" icon="🏠" label={t('remoteWorkers')} />
          <NavItem to="/clients" icon="🏢" label={t('clients')} />

          <SectionLabel label={t('reports')} />
          <NavItem to="/reports" icon="📅" label={t('attendanceReports')} />
          <NavItem to="/detailed-attendance" icon="📝" label={t('detailedAttendance')} />
          <NavItem to="/task-reports" icon="✅" label={t('taskReports')} />
          <NavItem to="/employee-performance" icon="📈" label={t('employeePerformance')} />
          <NavItem to="/settings" icon="⚙️" label={t('settings')} />
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-gray-800 truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.role}</div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span>🚪</span> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10 no-print">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline-block">
              {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button 
              onClick={toggleLanguage} 
              className="text-3xl transition-transform duration-500 hover:rotate-12 hover:scale-110 focus:outline-none"
              title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              {language === 'ar' ? '🇸🇦' : '🇧'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>

          <footer className="relative bg-white border-t border-gray-200 mt-auto pt-10 pb-6">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
              <Link to="/dashboard" className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg border border-gray-100 hover:scale-110 transition-transform duration-200">
                <img src={logo} alt="Skillup" className="w-10 h-10 object-contain" />
              </Link>
            </div>
            <div className="text-center text-gray-500 text-sm flex flex-col gap-1">
              <div>&copy; {new Date().getFullYear()} {t('systemTitle')}</div>
              <div className="text-xs text-gray-400 mt-1" dir="ltr">
                Kingdom of Saudi Arabia – Riyadh – License No (7041409280) ,Tel (+966-555876997)
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;