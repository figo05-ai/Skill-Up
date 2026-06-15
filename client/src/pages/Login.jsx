import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const { login, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email: form.email.trim(), password: form.password });
      // سيتم التوجيه تلقائياً عبر useEffect أدناه عند تحديث التوكن
    } catch (err) {
      console.error('Login error:', err);
      if (err.message === 'Network Error' && !err.response) {
        setError(t('networkError'));
      } else {
        setError(err.response?.data?.message || t('invalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  // مراقبة التوكن والتوجيه عند نجاح العملية (لحل مشكلة التأخير في تحديث الحالة)
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-['Cairo']">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left panel */}
        <div className="w-full md:w-1/2 bg-emerald-50 flex flex-col items-center justify-center p-12 text-gray-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 text-center">
            <img src={logo} alt="Skillup" className="h-150 mb-6 drop-shadow-lg object-contain mx-auto" />
            <h2 className="text-3xl font-bold mb-4 text-emerald-900">{t('systemTitle')}</h2>
            <p className="text-emerald-700 leading-relaxed">{t('systemDescription')}</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">{t('loginTitle')}</h1>
          <p className="text-sm text-gray-500 mb-8">{t('loginDesc')}</p>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {/* mail icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 h-12 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {/* lock icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 11v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
                  </svg>
                </span>

                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 h-12 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={t('passwordPlaceholder')}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {/* eye icon */}
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4.03 8.04a9 9 0 0111.94 0 1 1 0 01-1.42 1.42 7 7 0 00-9.1 0 1 1 0 11-1.42-1.42z" />
                      <path d="M10 13a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.196 0 2.342.204 3.397.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold h-12 rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {loading ? t('processing') : t('signIn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;