import React, { useState } from 'react';
import api from '../api/axios';
import ClientSelect from '../components/ClientSelect';
import { useLanguage } from '../context/LanguageContext';

const MonthlyReports = () => {
  const { t, language } = useLanguage();
  const [reportType, setReportType] = useState('attendance');
  const [clientId, setClientId] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPassword, setSenderPassword] = useState('');

  const reportTypes = [
    { value: 'attendance', label: t('attendanceReports') },
    { value: 'detailed_attendance', label: t('detailedAttendance') },
    { value: 'tasks', label: t('taskReports') },
    { value: 'performance', label: t('employeePerformance') },
  ];

  const handleSend = async () => {
    if (!clientId) {
      alert(t('selectClientFirst'));
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      // إرسال طلب للباك إند لإرسال التقرير
      await api.post('/reports/send-email', {
        reportType,
        clientId,
        year,
        month,
        senderEmail,
        senderPassword
      });
      setMessage({ type: 'success', text: t('emailSentSuccess') });
    } catch (err) {
      console.error(err);
      let msg = err.response?.data?.message || err.message || t('emailSentError');
      if (err.response && err.response.status === 404) {
        msg = language === 'ar' ? 'عذراً، خدمة الإرسال غير مبرمجة في السيرفر (404).' : 'Service endpoint not found (404). Backend implementation missing.';
      }
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('monthlyReports')}</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Sender Credentials (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">{t('senderEmail')}</label>
            <input 
              type="email" 
              value={senderEmail} 
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">{t('senderPassword')}</label>
            <input 
              type="password" 
              value={senderPassword} 
              onChange={(e) => setSenderPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
          <div className="col-span-full text-xs text-gray-500 text-center">{t('senderPasswordHint')}</div>
        </div>

        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">{t('reportType')}</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          >
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Client Select */}
        <div>
           <ClientSelect value={clientId} onChange={setClientId} />
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">{t('year')}</label>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">{t('month')}</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSend} 
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? t('sending') : t('sendReportViaEmail')}
        </button>

        {message.text && (
          <div className={`p-4 rounded-xl text-center font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReports;