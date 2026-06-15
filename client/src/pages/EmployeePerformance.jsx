import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { format, startOfMonth, endOfMonth, parseISO, differenceInMonths, isAfter, addDays, isValid } from 'date-fns';
import ClientSelect from '../components/ClientSelect';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.jpeg';

const EmployeePerformance = () => {
  const { t, language } = useLanguage();
  const [clientId, setClientId] = useState(null);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(0);
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState({});
  const [clientName, setClientName] = useState('');
  
  const [printData, setPrintData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const handleYearChange = (e) => {
    const y = Number(e.target.value);
    setYear(y);
    updateDates(y, month);
  };

  const handleMonthChange = (e) => {
    const m = Number(e.target.value);
    setMonth(m);
    updateDates(year, m);
  };

  const updateDates = (y, m) => {
    if (m === 0) {
      setStartDate(`${y}-01-01`);
      setEndDate(`${y}-12-31`);
    } else {
      const dateForMonth = new Date(y, m - 1, 15);
      setStartDate(format(startOfMonth(dateForMonth), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(dateForMonth), 'yyyy-MM-dd'));
    }
  };

  // جلب اسم العميل
  useEffect(() => {
    if (!clientId) return;
    const fetchClientName = async () => {
      try {
        const res = await api.get('/clients');
        const client = res.data.find(c => (c.id || c._id) === clientId);
        if (client) setClientName(client.name);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClientName();
  }, [clientId]);

  const handleGetEmployees = async () => {
    if (!clientId) {
      alert(t('selectClientFirst'));
      return;
    }
    try {
      const res = await api.get('/employees');
      const allEmployees = res.data || [];
      const filteredEmployees = allEmployees.filter(e => {
        const eClientId = e.client?.id || e.client?._id || e.client;
        return String(eClientId) === String(clientId) && e.status !== 'inactive';
      });
      setEmployees(filteredEmployees);
      setSelectedEmpIds({});
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      if (err.message === 'Network Error') {
        alert(t('networkError'));
      } else {
        alert(t('errorFetchingEmployees'));
      }
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedEmpIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = {};
      employees.forEach(e => all[e.id || e._id] = true);
      setSelectedEmpIds(all);
    } else {
      setSelectedEmpIds({});
    }
  };

  const handlePrintPerformance = async () => {
    const idsToPrint = Object.keys(selectedEmpIds).filter(id => selectedEmpIds[id]);
    if (idsToPrint.length === 0) {
      alert(t('selectOneEmployee'));
      return;
    }

    try {
      api.post('/auth/log', { action: 'PRINT_REPORT', details: `Performance Report - Client: ${clientName}, Date: ${startDate} to ${endDate}` }).catch(() => {});
      
      let allAttendance = [];
      let hasErrors = false;
      const seenIds = new Set();

      let currentStart = parseISO(startDate);
      const finalEnd = parseISO(endDate);

      while (!isAfter(currentStart, finalEnd)) {
        let chunkEnd = addDays(currentStart, 45);
        if (isAfter(chunkEnd, finalEnd)) chunkEnd = finalEnd;

        const chunkStartStr = format(currentStart, 'yyyy-MM-dd');
        const chunkEndStr = format(chunkEnd, 'yyyy-MM-dd');

        try {
          let attRes;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              attRes = await api.get('/attendance/history', {
                params: { startDate: chunkStartStr, endDate: chunkEndStr, limit: 5000, all: true }
              });
              break;
            } catch (err) {
              if (attempt === 2) throw err;
              const delay = err.response?.status === 429 ? 2000 : 500;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }

          const data = attRes?.data ? (Array.isArray(attRes.data) ? attRes.data : (attRes.data.data || [])) : [];
          data.forEach(item => {
            const itemId = item.id || item._id;
            if (!seenIds.has(itemId)) {
              seenIds.add(itemId);
              allAttendance.push(item);
            }
          });
        } catch (e) {
          console.error(`Error fetching chunk ${chunkStartStr}`, e);
          hasErrors = true;
        }
        
        currentStart = addDays(chunkEnd, 1);
      }

      const reportData = [];
      for (const id of idsToPrint) {
        const emp = employees.find(e => String(e.id || e._id) === String(id));
        
        const attendanceData = allAttendance.filter(a => String(a.userRef || a.user?.id || a.user?._id) === String(id));
        
        // حسابات الحضور
        const totalWorkDays = attendanceData.length;
        const totalMinutes = attendanceData.reduce((acc, curr) => {
            const val = Number(curr.workHours || curr.work_hours) || 0;
            const h = Math.floor(val);
            const m = Math.round((val - h) * 60);
            return acc + h * 60 + m;
        }, 0);
        const totalWorkHours = totalMinutes / 60;

        // 1. الساعات المخططة (حسب الرقم المدخل في ساعات العمل الشهرية للموظف)
        // حساب عدد الأشهر بناءً على الفترة المختارة في التقرير بغض النظر عن تاريخ الالتحاق
        const monthsDiff = Math.max(differenceInMonths(parseISO(endDate), parseISO(startDate)) + 1, 1);
        const plannedHours = (Number(emp.monthlyWorkHours) || 176) * monthsDiff;

        // 2 & 3. الساعات المنجزة = اجمالي ساعات العمل
        const deduction = (Number(emp.absentDays) || 0) * 8;
        const effectiveHours = Math.max(0, totalWorkHours - deduction);

        // 4. الساعات المتبقية = الساعات المخططة - الساعات المنجزة
        const remainingHours = plannedHours - effectiveHours;

        // 5. نسبة التفاعل = (الساعات المنجزة * 100) / الساعات المخططة
        const activePercentage = plannedHours > 0 ? (effectiveHours * 100) / plannedHours : 0;

        reportData.push({
          ...emp,
          totalWorkHours,
          totalWorkDays,
          plannedHours,
          effectiveHours,
          remainingHours,
          activePercentage
        });
      }

      setPrintData({
        clientName,
        employees: reportData,
        startDate,
        endDate
      });
      setIsPrinting(true);
    } catch (err) {
      console.error(err);
      if (err.message === 'Network Error') {
        alert(t('networkError'));
      } else {
        alert(t('errorPreparingReport'));
      }
    }
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintData(null);
      setIsPrinting(false);
    };
    if (isPrinting && printData) {
      const timer = setTimeout(() => {
        window.addEventListener('afterprint', handleAfterPrint, { once: true });
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [isPrinting, printData]);

  const formatHours = (val) => {
    let h = Math.floor(val);
    let m = Math.round((val - h) * 60);
    if (m === 60) { h += 1; m = 0; }
    return `${h}:${m < 10 ? '0' : ''}${m}`;
  };

  // حسابات تقسيم الصفحات (Pagination)
  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = employees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSelectPage = (e) => {
    if (e.target.checked) {
      const all = { ...selectedEmpIds };
      paginatedEmployees.forEach(emp => all[emp.id || emp._id] = true);
      setSelectedEmpIds(all);
    } else {
      const newSelected = { ...selectedEmpIds };
      paginatedEmployees.forEach(emp => delete newSelected[emp.id || emp._id]);
      setSelectedEmpIds(newSelected);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('reportTitlePerformance')}</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={handleGetEmployees} className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700">
          {t('getEmployee')}
        </button>
        <button onClick={handlePrintPerformance} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          {t('print')}
        </button>
        <button 
          onClick={() => setShowHeaderFooter(!showHeaderFooter)}
          className={`px-6 py-2 rounded font-bold transition-colors ${showHeaderFooter ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          {showHeaderFooter ? (language === 'ar' ? 'إخفاء الهيدر والفوتر' : 'Hide Header & Footer') : (language === 'ar' ? 'إظهار الهيدر والفوتر' : 'Show Header & Footer')}
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ClientSelect value={clientId} onChange={(id) => {
              setClientId(id);
              if (!id) setClientName('');
            }} />
            <div>
              <label className="block text-sm font-medium mb-1">{t('year')}</label>
              <input type="number" value={year} onChange={handleYearChange} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('month')}</label>
              <select value={month} onChange={handleMonthChange} className="w-full border p-2 rounded">
                <option value={0}>{t('allMonths')}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('start_date')}</label>
                <input type="date" lang="en-GB" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border p-2 rounded" />
                <div className="text-xs text-gray-500 mt-1 dir-ltr text-right">{startDate && isValid(parseISO(startDate)) ? format(parseISO(startDate), 'dd/MM/yyyy') : ''}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('end_date')}</label>
                <input type="date" lang="en-GB" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border p-2 rounded" />
                <div className="text-xs text-gray-500 mt-1 dir-ltr text-right">{endDate && isValid(parseISO(endDate)) ? format(parseISO(endDate), 'dd/MM/yyyy') : ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 border-r">{t('no')}</th>
              <th className="p-3 border-r text-center w-20">
                <div className="flex flex-col items-center justify-center gap-2">
                  <label className="text-[10px] flex items-center gap-1 cursor-pointer mb-0" title={language === 'ar' ? 'تحديد الكل' : 'Select all'}>
                    <input type="checkbox" onChange={handleSelectAll} checked={employees.length > 0 && employees.every(e => selectedEmpIds[e.id || e._id])} />
                    <span>{language === 'ar' ? 'الكل' : 'All'}</span>
                  </label>
                  <label className="text-[10px] flex items-center gap-1 cursor-pointer text-emerald-600 mb-0" title={language === 'ar' ? 'تحديد هذه الصفحة فقط' : 'Select this page only'}>
                    <input type="checkbox" onChange={handleSelectPage} checked={paginatedEmployees.length > 0 && paginatedEmployees.every(e => selectedEmpIds[e.id || e._id])} />
                    <span>{language === 'ar' ? 'الصفحة' : 'Page'}</span>
                  </label>
                </div>
              </th>
              <th className="p-3 border-r">{t('employee')}</th>
              <th className="p-3 border-r">{t('identity')}</th>
              <th className="p-3 border-r">{t('start_date')}</th>
              <th className="p-3 border-r">{t('jobTitle')}</th>
              <th className="p-3 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length > 0 ? paginatedEmployees.map((emp, index) => (
              <tr key={emp.id || emp._id} className="border-b hover:bg-gray-50">
                <td className="p-3 border-r">{startIndex + index + 1}</td>
                <td className="p-3 border-r text-center"><input type="checkbox" checked={!!selectedEmpIds[emp.id || emp._id]} onChange={() => handleCheckboxChange(emp.id || emp._id)} /></td>
                <td className="p-3 border-r">{emp.name}</td>
                <td className="p-3 border-r">{emp.identityNumber || '-'}</td>
                <td className="p-3 border-r">{emp.joiningDate ? format(new Date(emp.joiningDate), 'dd/MM/yyyy') : '-'}</td>
                <td className="p-3 border-r">{emp.jobTitle || '-'}</td>
                <td className="p-3 text-center">
                  <Link to={`/employees/${emp.id || emp._id}`} className="text-emerald-600 hover:text-emerald-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </td>
              </tr>
            )) : (<tr><td colSpan="7" className="p-4 text-center text-red-600 font-bold text-lg">{t('noEmployeesFound')}</td></tr>)}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded shadow mb-6 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          >
            {language === 'ar' ? 'السابق' : 'Previous'}
          </button>
          <span className="text-sm text-gray-600 font-bold">
            {language === 'ar' ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          >
            {language === 'ar' ? 'التالي' : 'Next'}
          </button>
        </div>
      )}

      {printData && isPrinting && (
        <div id="printable-content">
          <div className="page-break" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {showHeaderFooter && (
            <div className="print-footer-fixed text-center px-10 pb-5 text-[10px] text-gray-600">
                <div className="border-t-2 border-emerald-600 mb-2"></div>
                <p dir="rtl">المملكة العربية السعودية – الرياض – ترخيص رقم (7041409280) هاتف (+966-555876997)</p>
                <p dir="ltr">Kingdom of Saudi Arabia – Riyadh – License No (7041409280) ,Tel (+966-555876997)</p>
            </div>
            )}

            {showHeaderFooter && (
            <div className="print-header-fixed px-10 pt-5 pb-2">
              <header className="mb-4 relative">
                <div className="flex justify-between items-end pb-2 border-b-2 border-emerald-600">
                  <div className="w-1/3">
                    <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
                  </div>
                  <div className="w-1/3 text-right">
                    <h2 className="text-2xl font-extrabold text-emerald-600">شركة أسكيل أب</h2>
                    <p className="text-gray-500 font-bold tracking-widest text-xs">SKILLUP</p>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <h1 className="text-lg font-bold">{t('printTitlePerformanceReport')}</h1>
                  <h2 className="text-base text-gray-600">{printData.clientName}</h2>
                  <p className="text-xs text-gray-500">{t('from')}: {format(new Date(printData.startDate), 'dd/MM/yyyy')} - {t('to')}: {format(new Date(printData.endDate), 'dd/MM/yyyy')}</p>
                </div>
              </header>
            </div>
            )}

            <table className="w-full">
              <thead>
                <tr>
                  <td>
                    {/* Spacer for Header */}
                    <div className={showHeaderFooter ? "h-[180px]" : "h-[20px]"}></div>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-10 align-top">
                    <table className="w-full border-collapse text-center text-sm border border-black">
                      <thead>
                        <tr className="bg-gray-200 border-b border-black">
                          <th className="border border-black p-2 w-12">{t('no')}</th>
                          <th className="border border-black p-2">{t('employee')}</th>
                          <th className="border border-black p-2">{t('identity')}</th>
                          <th className="border border-black p-2">{t('jobTitle')}</th>
                          <th className="border border-black p-2">{t('totalWorkHours')}</th>
                          <th className="border border-black p-2">{t('totalWorkDays')}</th>
                          <th className="border border-black p-2">{t('plannedHours')}</th>
                          <th className="border border-black p-2">{t('effectiveHours')}</th>
                          <th className="border border-black p-2">{t('remainingHours')}</th>
                          <th className="border border-black p-2">{t('activePercentage')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printData.employees.map((emp, idx) => (
                          <tr key={emp.id || emp._id}>
                            <td className="border border-black p-2">{idx + 1}</td>
                            <td className="border border-black p-2">{emp.name}</td>
                            <td className="border border-black p-2">{emp.identityNumber || '-'}</td>
                            <td className="border border-black p-2">{emp.jobTitle || '-'}</td>
                            <td className="border border-black p-2">{formatHours(emp.totalWorkHours)}</td>
                            <td className="border border-black p-2">{emp.totalWorkDays}</td>
                            <td className="border border-black p-2">{formatHours(emp.plannedHours)}</td>
                            <td className="border border-black p-2">{formatHours(emp.effectiveHours)}</td>
                            <td className="border border-black p-2">{formatHours(emp.remainingHours)}</td>
                            <td className="border border-black p-2">{emp.activePercentage.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    {/* Spacer to prevent content overlapping with fixed footer */}
                    <div className={showHeaderFooter ? "h-[80px]" : "h-[20px]"}></div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePerformance;