import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.jpeg';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const shortcuts = [
    { to: '/employees', label: t('employees'), icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { to: '/remote-workers', label: t('remoteWorkers'), icon: '🏠', color: 'bg-purple-50 text-purple-600' },
    { to: '/clients', label: t('clients'), icon: '🏢', color: 'bg-orange-50 text-orange-600' },
    { to: '/reports', label: t('attendanceReports'), icon: '📅', color: 'bg-green-50 text-green-600' },
    { to: '/detailed-attendance', label: t('detailedAttendance'), icon: '📝', color: 'bg-teal-50 text-teal-600' },
    { to: '/task-reports', label: t('taskReports'), icon: '✅', color: 'bg-indigo-50 text-indigo-600' },
    { to: '/employee-performance', label: t('employeePerformance'), icon: '📈', color: 'bg-rose-50 text-rose-600' },
    ...(user?.role === 'admin' ? [{ to: '/dev', label: t('devTools'), icon: '🛠️', color: 'bg-gray-800 text-white' }] : []),
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">{t('dashboard')}</h1>
          <p className="text-gray-500 mt-1">{t('welcome')}, {user?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {shortcuts.map((item, index) => (
          <Link key={index} to={item.to} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-center text-center group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${item.color} group-hover:scale-110 transition-transform duration-200`}>
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{item.label}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;