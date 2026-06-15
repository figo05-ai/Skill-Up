import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const RemoteWorkers = () => {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchJobTitle, setSearchJobTitle] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, clientRes] = await Promise.all([
        api.get('/employees'),
        api.get('/clients')
      ]);
      setClients(clientRes.data);
      // تصفية الموظفين الذين حالتهم "عن بعد" فقط

      const validClientIds = new Set(clientRes.data.map(c => String(c.id || c._id)));
      const remoteOnly = res.data.filter(e => {
        const eClientId = e.client?.id || e.client?._id || e.client;
        return e.status === 'remote' && eClientId && validClientIds.has(String(eClientId));
      });

      setEmployees(remoteOnly);
      setFilteredEmployees(remoteOnly);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // منطق البحث والفلترة
  useEffect(() => {
    const filtered = employees.filter(emp => {
      const nameMatch = emp.name.toLowerCase().includes(searchName.toLowerCase());
      const jobMatch = (emp.jobTitle || '').toLowerCase().includes(searchJobTitle.toLowerCase());
      
      const empClientId = emp.client?.id || emp.client?._id || emp.client;
      const clientMatch = searchClient ? String(empClientId) === String(searchClient) : true;

      return nameMatch && jobMatch && clientMatch;
    });
    setFilteredEmployees(filtered);
  }, [searchName, searchJobTitle, searchClient, employees]);

  const handleDisable = async (id) => {
    if (!window.confirm(t('confirmDisable'))) return;
    try {
      // تحديث حالة الموظف إلى inactive
      await api.put(`/employees/${id}`, { status: 'inactive' });
      // تحديث القائمة
      fetchData();
    } catch (err) {
      console.error(err);
      alert(t('errorDisabling'));
    }
  };


  const handleExportExcel = () => {
    api.post('/auth/log', { action: 'EXPORT_EXCEL', details: 'Exported Remote Workers list' }).catch(() => {});
    const data = filteredEmployees.map(emp => {
      const clientId = emp.client?.id || emp.client?._id || emp.client;
      const client = clients.find(c => String(c.id || c._id) === String(clientId));
      const clientName = client ? client.name : (emp.client?.name || '-');

      return {
        [t('name')]: emp.name,
        [t('client')]: clientName,
        [t('jobTitle')]: emp.jobTitle,
        [t('identity')]: emp.identityNumber,
        [t('joiningDate')]: emp.joiningDate ? format(new Date(emp.joiningDate), 'yyyy-MM-dd') : '',
        [t('status')]: t(emp.status) || emp.status
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Remote Workers");
    XLSX.writeFile(wb, "Remote_Workers.xlsx");
  };

  const clientData = clients.map(client => {
    const count = employees.filter(emp => {
      const empClientId = emp.client?.id || emp.client?._id || emp.client;
      return String(empClientId) === String(client.id || client._id);
    }).length;
    return { name: client.name, value: count };
  }).filter(client => client.value > 0);

  const totalRemoteWorkers = employees.length;

  const getPercentage = (value) => {
    return ((value / totalRemoteWorkers) * 100).toFixed(2);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{t('remoteWorkersTitle')}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t('remoteWorkersDesc')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            {t('exportExcel')}
          </button>
          <Link to="/employees" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('addEmployee')}
          </Link>
        </div>
      </div>

      {/* خانات البحث */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('name')}</label>
          <div className="relative">
            <input 
              type="text" 
              value={searchName} 
              onChange={(e) => setSearchName(e.target.value)} 
              placeholder={t('searchNamePlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('jobTitle')}</label>
          <div className="relative">
            <input 
              type="text" 
              value={searchJobTitle} 
              onChange={(e) => setSearchJobTitle(e.target.value)} 
              placeholder={t('searchJobTitlePlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('company')}</label>
          <div className="relative">
            <select 
              value={searchClient} 
              onChange={(e) => setSearchClient(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none"
            >
              <option value="">{t('allCompanies')}</option>
              {clients.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

       {/* Pie Chart */}
      {clientData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{t('companyEmployees')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={clientData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {clientData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} (${getPercentage(value)}%)`, name]}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* الجدول */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 text-sm uppercase tracking-wider">
              <th className="p-3 border-r">{t('name')}</th>
              <th className="p-3 border-r">{t('client')}</th>
              <th className="p-3 border-r">{t('jobTitle')}</th>
              <th className="p-3 border-r">{t('identity')}</th>
              <th className="p-3 border-r">{t('joiningDate')}</th>
              <th className="p-3 text-center">{t('disable')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center">{t('loading')}</td></tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const clientId = emp.client?.id || emp.client?._id || emp.client;
                const client = clients.find(c => String(c.id || c._id) === String(clientId));
                const clientName = client ? client.name : (emp.client?.name || '-');


                return (
                <tr key={emp.id || emp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 border-r border-gray-50 font-medium text-gray-800">{emp.name}</td>
                  <td className="p-4 border-r border-gray-50 text-gray-600">{clientName}</td>
                  <td className="p-4 border-r border-gray-50 text-gray-600">{emp.jobTitle || '-'}</td>
                  <td className="p-4 border-r border-gray-50 text-gray-600 font-mono text-sm">{emp.identityNumber || '-'}</td>
                  <td className="p-4 border-r border-gray-50 text-gray-600">{emp.joiningDate ? format(new Date(emp.joiningDate), 'dd/MM/yyyy') : '-'}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDisable(emp.id || emp._id)} 
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      {t('disable')}
                    </button>
                  </td>
                </tr>
              );
              })
            ) : (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">{t('noRemoteWorkersFound')}</td></tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default RemoteWorkers;