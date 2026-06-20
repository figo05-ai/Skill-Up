import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const KNOWN_JOB_TITLES = [
  'HELPERS', 'أخصائي إدارة مشاريع', 'أخصائي إداري', 'أخصائي استشارات أعمال', 'أخصائي اعلامي', 'أخصائي التزام', 'أخصائي تحليل مالي', 'أخصائي تدريب وتطوير موارد بشرية', 'أخصائي تسويق', 'أخصائي تطوير إداري', 'أخصائي توظيف', 'أخصائي جودة', 'أخصائي خدمة عملاء', 'أخصائي عقود', 'أخصائي علاقات عامة', 'أخصائي علوم حاسب آلي', 'أخصائي عمليات موارد بشرية', 'أخصائي قانوني', 'أخصائي مبيعات', 'أخصائي مراقبة مخزون', 'أخصائي مراقبة موارد بشرية', 'أخصائي مستودعات', 'أخصائي مشاريع', 'أخصائي مشتريات', 'أخصائي مكتبات', 'أخصائي موازنة مالية', 'أمين صندوق', 'أمين مخزن', 'أمين مستودع فني', 'إداري', 'إداري عام', 'إداري مواقع إلكترونية', 'اختصاصي تسويق', 'اخصائى مشتريات', 'اخصائي إدارة خدمات', 'اخصائي استشارات اعمال', 'اخصائي تأمين', 'اخصائي توظيف', 'اخصائي خدمات عملاء', 'اخصائي خدمة عملاء', 'اخصائي خدمه عملاء', 'اخصائي دعم فني', 'اخصائي عقود', 'اخصائي علاقات عامة', 'اخصائي عمليات موارد بشرية', 'اخصائي قانوني', 'اخصائي مبيعات', 'اخصائي مراقبة مخزون', 'اخصائي مراقبة موارد بشرية', 'اخصائي مشاريع', 'اخصائي مشتريات', 'اداري عام', 'اداري مواقع الكترونيه', 'اعمال ادارية', 'بائع', 'بائع عطور', 'بائع هاتفي', 'تسويق', 'جامع بيانات', 'حارس أمن', 'خدمة العملاء', 'خدمة عملاء', 'رئيس مجلس إدارة', 'رسام خرائط', 'رسام هندسي', 'سائق سيارة', 'سائق سيارة أجرة', 'سائق شاحنة صغيرة', 'سكرتير', 'سكرتير تنفيذي', 'ضابط علاقات عامة', 'عامل تصنيع', 'عامل تعبئة رفوف', 'علاقات عامة', 'فني تدفئة وتهوية وتكييف', 'فني تصميم داخلي', 'فني تصميم معارض', 'فني دعم برامج', 'فني سلامة وصحة مهنية', 'فني صيانة آلات كهربائية', 'فني كهرباء', 'فني مدني', 'فني مساحة', 'فني ميكانيكي', 'فني نظم حاسب آلي', 'فني نظم معلومات', 'كاتب', 'كاتب إداري عام', 'كاتب اتصال', 'كاتب اتصالات', 'كاتب اختزال', 'كاتب ادارى عام', 'كاتب اداري', 'كاتب اداري عام', 'كاتب ادخال بيانات', 'كاتب استعلامات', 'كاتب استعلامات خدمة عملاء', 'كاتب استعلامات مركز خدمة عملاء', 'كاتب استقبال خدمة عملاء', 'كاتب موارد بشرية', 'كاتب مراسلات', 'محصل', 'مساعد إداري', 'مندوب مبيعات', 'مندوب مشتريات', 'مراقب عام', 'اخصائي استقدام', 'مترجم', 'مهندس', 'محاسب', 'موظف استقبال', 'مدخل بيانات', 'مدير تطوير موارد بشرية', 'كاتب بيانات عملاء', 'كاتب حسابات', 'كاتب رواتب', 'مدير تخطيط قوى عاملة', 'مدير مكتب', 'مدير مالي', 'مدير إداري', 'أخصائي تخطيط قوى عاملة', 'أخصائي أداء مؤسسي', 'مشرف مكتب', 'موظف علاقات عامه', 'كاتب علاقات حكومية (مندوب تعقيب)', 'كاتب علاقات حكومية'
  , 'كاتب إنتاج', 'كاتب تدقيق بيانات', 'كاتب حفظ ملفات', 'كاتب حركة مخزون', 'فني صحة عامة', 'محلل بيانات', 'كاتب بريدي', 'كاتب سجل', 'مدبر إداري', 'مساعد إداري', 'موظف إداري مبتدئ', 'كاتب عام', 'كيميائي', 'أخصائي مختبر', 'فني جودة', 'الثانوية العامة', 'بكالوريوس تخصص الكيمياء', 'بكالوريوس تخصص الكیمیاء', 'بكلوریوس - منتظمة تخصص المحسبة',
  'فني ميكانيكي محركات', 'مهندس مدني', 'مهندس ميكانيكي', 'فني كهربائي أنظمة حماية كهربائية', 'فني أجهزة إلكترونية', 'فني ميكانيكي مركبات', 'مهندس إدارة مشاريع', 'مهندس معماري', 'فني كهربائي شبكات توزيع أرضية', 'فني علوم أغذية', 'فني دعم تقنية معلومات (IT Support)', 'فني دعم تقنية معلومات', 'مهندس شبكات', 'فني صيانة أجهزة كهربائية'
<<<<<<< HEAD
  , 'مدير مبيعات تجزئة', 'مدير عام', 'مدير عمليات هندسة صناعية', 'مدير تدريب', 'مدير علاقات عامة', 'مدير مصنع', 'مدير توظيف' ,'أخصائي أمن بيانات' ,'مراقب حركة مركبات','مراسل'
=======
  , 'مدير مبيعات تجزئة', 'مدير عام', 'مدير عمليات هندسة صناعية', 'مدير تدريب', 'مدير علاقات عامة', 'مدير مصنع', 'مدير توظيف'
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
];

const DevTools = () => {
  const { user } = useAuth();
  const [isDevAuth, setIsDevAuth] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [empForm, setEmpForm] = useState({ name: '', email: '', password: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '' });
  const [msg, setMsg] = useState('');
  
  const [checkEmpId, setCheckEmpId] = useState('');
  const [checkStartDate, setCheckStartDate] = useState('2026-01-01');
  const [checkEndDate, setCheckEndDate] = useState('2026-03-31');
  const [attendanceResult, setAttendanceResult] = useState(null);
  
  const [seedStartDate, setSeedStartDate] = useState('2026-01-01');
  const [seedEndDate, setSeedEndDate] = useState('2026-12-31');
  const [seedClientId, setSeedClientId] = useState('');

  const [scanYear, setScanYear] = useState(2026);
  const [scanResults, setScanResults] = useState(null);

  // حساب المسميات الوظيفية غير المعتمدة
  const unmappedJobTitles = React.useMemo(() => {
    const unmapped = {};
    // دالة لتجاهل المسافات والهمزات أثناء الفحص
    const normalize = (t) => String(t).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ىئ]/g, 'ي').replace(/\s+/g, '').trim();
    const knownNormalized = KNOWN_JOB_TITLES.map(normalize);

    employees.forEach(emp => {
       if (!emp.jobTitle || emp.status === 'inactive') return;
       const title = String(emp.jobTitle).trim();
       const normalizedTitle = normalize(title);
       if (!KNOWN_JOB_TITLES.includes(title) && !knownNormalized.includes(normalizedTitle)) {
           if (!unmapped[title]) unmapped[title] = [];
           unmapped[title].push(emp.name);
       }
    });
    return unmapped;
  }, [employees]);

  const fetch = async () => {
    try {
      const e = await api.get('/employees');
      setEmployees(e.data || []);
      const t = await api.get('/tasks');
      setTasks(t.data || []);
      const c = await api.get('/clients');
      setClients(c.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isDevAuth) fetch();
  }, [isDevAuth]);

  const createEmp = async (ev) => {
    ev.preventDefault();
    try {
      await api.post('/employees', empForm);
      setMsg('Employee created');
      setEmpForm({ name: '', email: '', password: '' });
      fetch();
    } catch (err) { setMsg(err.response?.data?.message || 'Create failed'); }
  };

  const createTask = async (ev) => {
    ev.preventDefault();
    try {
      await api.post('/tasks', taskForm);
      setMsg('Task created');
      setTaskForm({ title: '', description: '', assignedTo: '' });
      fetch();
    } catch (err) { setMsg(err.response?.data?.message || 'Create failed'); }
  };

  const checkAttendance = async (ev) => {
    ev.preventDefault();
    if (!checkEmpId) return;
    api.post('/auth/log', { action: 'DEV_INSPECT_DB', details: `Inspected attendance for user ${checkEmpId}` }).catch(() => {});
    setAttendanceResult('Loading...');
    try {
      const res = await api.get('/attendance/history', {
        params: { userId: checkEmpId, startDate: checkStartDate, endDate: checkEndDate, limit: 1000, all: true }
      });
      setAttendanceResult(res.data);
    } catch (err) {
      setAttendanceResult({ error: err.message, response: err.response?.data });
    }
  };

  const handleSeed = async (ev) => {
    ev.preventDefault();
    
    let targetEmployees = [];
    if (seedClientId) {
      targetEmployees = employees.filter(e => {
        const cId = e.client?.id || e.client?._id || e.client;
        return String(cId) === String(seedClientId) && e.status !== 'inactive';
      });
    } else {
      targetEmployees = employees.filter(e => e.status !== 'inactive');
    }

    if (targetEmployees.length === 0) {
      setMsg('لا يوجد موظفين نشطين لهذه الشركة.');
      return;
    }

    if (!window.confirm(`هل أنت متأكد؟ سيتم توليد بيانات حضور عشوائية لـ ${targetEmployees.length} موظف نشط.`)) return;
    
    setMsg('جاري التوليد...');
    let successCount = 0;
    const errors = [];

    for (const emp of targetEmployees) {
      try {
        const payload = { 
          startDate: seedStartDate, 
          endDate: seedEndDate, 
          userId: emp.id || emp._id,
          employeeId: emp.id || emp._id
        };
        if (seedClientId) payload.clientId = seedClientId;

        await api.post('/attendance/seed', payload);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 50));
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
        errors.push(`${emp.name}: ${errMsg}`);
      }
    }
    
    let resultMsg = `تم الانتهاء. تم التوليد لـ ${successCount} موظف.`;
    if (errors.length > 0) {
      resultMsg += ` | فشل التوليد لـ ${errors.length} موظف. (راجع الكونسول للتفاصيل)`;
    }
    setMsg(resultMsg);
  };

  const handleDeleteAll = async () => {
    let targetEmployees = [];
    if (seedClientId) {
      targetEmployees = employees.filter(e => {
        const cId = e.client?.id || e.client?._id || e.client;
        return String(cId) === String(seedClientId);
      });
    } else {
      targetEmployees = employees;
    }

    if (targetEmployees.length === 0) {
      setMsg('لا يوجد موظفين.');
      return;
    }

    if (!window.confirm(`تحذير خطير! ⚠️\nهل أنت متأكد من حذف جميع بيانات الحضور لـ ${targetEmployees.length} موظف في الفترة من ${seedStartDate} إلى ${seedEndDate}؟\nلا يمكن التراجع عن هذا الإجراء!`)) return;

    setMsg('جاري الحذف...');
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < targetEmployees.length; i++) {
      const emp = targetEmployees[i];
      setMsg(`جاري حذف بيانات ${emp.name} (${i + 1}/${targetEmployees.length})...`);
      
      try {
        const payload = { 
          startDate: seedStartDate, 
          endDate: seedEndDate,
          userId: emp.id || emp._id,
          employeeId: emp.id || emp._id
        };
        if (seedClientId) payload.clientId = seedClientId;

        await api.delete('/attendance/range', { params: payload, data: payload });
        successCount++;
        await new Promise(r => setTimeout(r, 50));
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.error(`Failed to delete for ${emp.name}`, err);
        if (err.response?.data) {
          console.error('Server Error Details:', err.response.data);
        }
        failCount++;
      }
    }

    setMsg(`تم الانتهاء. تم الحذف لـ ${successCount} موظف. فشل: ${failCount}`);
  };

  const handleScanYear = async () => {
    api.post('/auth/log', { action: 'DEV_SCAN_DATA', details: `Scanned data availability for year ${scanYear}` }).catch(() => {});
    setScanResults({});
    const results = {};
    
    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, '0');
      // حساب آخر يوم في الشهر يدوياً لضمان الدقة
      const lastDay = new Date(scanYear, m, 0).getDate();
      const start = `${scanYear}-${mStr}-01`;
      const end = `${scanYear}-${mStr}-${lastDay}`;

      try {
        // نطلب عدد قليل فقط للتأكد من الوجود، لكن الـ API الحالية ترجع الكل
        // سنستخدم limit 1 لتخفيف الحمل إذا كنا فقط نفحص الوجود، 
        // لكن لمعرفة العدد الفعلي نحتاج limit كبير أو endpoint مخصص للعد.
        // هنا سنستخدم limit 1000 لنأخذ فكرة تقريبية
        const res = await api.get('/attendance/history', {
          params: { startDate: start, endDate: end, limit: 1000, all: true }
        });
        results[m] = Array.isArray(res.data) ? res.data.length : 0;
        setScanResults(prev => ({ ...prev, [m]: results[m] }));
      } catch (err) {
        console.error(`Error scanning month ${m}`, err);
        results[m] = 'Error';
        setScanResults(prev => ({ ...prev, [m]: 'Error' }));
      }
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      setMsg('Employee deleted');
      fetch();
    } catch (err) {
      setMsg('Delete failed');
    }
  };

  const handleDownloadUnmappedTitles = () => {
    const titles = Object.keys(unmappedJobTitles);
    if (titles.length === 0) return;
    const blob = new Blob([titles.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unmapped_job_titles.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-500">Only administrators can access Developer Tools.</p>
      </div>
    );
  }

  if (!isDevAuth) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center max-w-md w-full">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Developer Access</h1>
          <p className="text-gray-500 mb-6">This area is restricted. Please enter the access code.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (devPassword === 'Alama123@') setIsDevAuth(true);
            else alert('Access Denied');
          }} className="space-y-4">
            <input 
              type="password" 
              value={devPassword} 
              onChange={e => setDevPassword(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-center tracking-widest"
              placeholder="••••••••"
              autoFocus
            />
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Dev Tools</h1>
      <div className="mb-4 text-sm text-gray-600">Signed in as: {user?.name} ({user?.role})</div>
      
      {/* Data Scanner Section */}
      <div className="bg-white p-4 rounded shadow mb-6 border-l-4 border-yellow-500">
        <h2 className="text-lg font-bold mb-3">📊 Data Availability Scanner (فحص البيانات)</h2>
        <div className="flex gap-4 items-end mb-4">
          <div>
            <label className="block text-xs mb-1">Year to Scan</label>
            <input 
              type="number" 
              value={scanYear} 
              onChange={e => setScanYear(Number(e.target.value))} 
              className="border p-2 rounded w-32" 
            />
          </div>
          <button onClick={handleScanYear} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
            Scan All Months
          </button>
        </div>
        
        {scanResults && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <div key={m} className={`p-2 rounded text-center border ${scanResults[m] > 0 ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-50 border-red-200 text-red-400'}`}>
                <div className="font-bold text-xs uppercase">Month {m}</div>
                <div className="text-lg font-mono">
                  {scanResults[m] !== undefined ? (scanResults[m] === 1000 ? '1000+' : scanResults[m]) : '...'}
                </div>
                <div className="text-[10px] text-gray-500">{scanResults[m] > 0 ? 'Records Found' : 'No Data'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unmapped Job Titles Scanner */}
      <div className="bg-white p-4 rounded shadow mb-6 border-l-4 border-red-500">
        <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
          <h2 className="text-lg font-bold text-red-700">⚠️ Unmapped Job Titles (مكتشف المسميات الغريبة)</h2>
          {Object.keys(unmappedJobTitles).length > 0 && (
            <button
              onClick={handleDownloadUnmappedTitles}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors shadow-sm"
            >
              تحميل المسميات (TXT)
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          هذه القائمة تعرض المسميات الوظيفية الموجودة حالياً في قاعدة البيانات (والتي تم رفعها بالخطأ أو عبر الإكسل) ولكنها غير مطابقة للقائمة المعتمدة في النظام. يرجى تعديلها للموظفين حتى يتمكن النظام من توليد مهام لهم.
        </p>
        
        {Object.keys(unmappedJobTitles).length === 0 ? (
          <div className="text-green-600 font-bold p-3 bg-green-50 border border-green-200 rounded text-center">
            ✅ ممتاز! جميع المسميات الوظيفية للموظفين النشطين مطابقة للنظام بالكامل.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(unmappedJobTitles).map(([title, emps]) => (
              <div key={title} className="border border-red-200 rounded p-3 bg-red-50 shadow-sm">
                <div className="font-bold text-red-800 text-base mb-1">"{title}"</div>
                <div className="text-xs text-red-600 mb-2 font-semibold">عدد الموظفين: {emps.length}</div>
                <ul className="text-xs text-gray-800 max-h-32 overflow-y-auto list-disc list-inside bg-white p-2 rounded border border-red-100">
                  {emps.map((e, i) => <li key={i} className="truncate" title={e}>{e}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-6 border-l-4 border-blue-500">
        <h2 className="text-lg font-bold mb-3">🔍 Database Inspector (Attendance)</h2>
        <form onSubmit={checkAttendance} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs mb-1">Employee</label>
            <select value={checkEmpId} onChange={e => setCheckEmpId(e.target.value)} className="border p-2 rounded">
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Start</label>
            <input type="date" value={checkStartDate} onChange={e => setCheckStartDate(e.target.value)} className="border p-2 rounded" />
          </div>
          <div>
            <label className="block text-xs mb-1">End</label>
            <input type="date" value={checkEndDate} onChange={e => setCheckEndDate(e.target.value)} className="border p-2 rounded" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Check API Data</button>
        </form>
        {attendanceResult && (
          <div className="mt-4 bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-60 text-xs font-mono">
            <div className="mb-2 font-bold text-white border-b border-gray-700 pb-1">
              Result Count: {Array.isArray(attendanceResult) ? attendanceResult.length : 'N/A'}
            </div>
            <pre>{JSON.stringify(attendanceResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold mb-3">🌱 Data Seeder (توليد بيانات)</h2>
        <form onSubmit={handleSeed} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs mb-1">Company</label>
            <select value={seedClientId} onChange={e => setSeedClientId(e.target.value)} className="border p-2 rounded w-40">
              <option value="">All Companies</option>
              {clients.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Start</label>
            <input type="date" value={seedStartDate} onChange={e => setSeedStartDate(e.target.value)} className="border p-2 rounded" />
          </div>
          <div>
            <label className="block text-xs mb-1">End</label>
            <input type="date" value={seedEndDate} onChange={e => setSeedEndDate(e.target.value)} className="border p-2 rounded" />
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Generate Attendance</button>
          <button type="button" onClick={handleDeleteAll} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete Data</button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg mb-3">Create Employee</h2>
          <form onSubmit={createEmp} className="space-y-2">
            <input placeholder="Name" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full p-2 border rounded" />
            <input placeholder="Email" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} className="w-full p-2 border rounded" />
            <input placeholder="Password" type="password" value={empForm.password} onChange={e => setEmpForm({...empForm, password: e.target.value})} className="w-full p-2 border rounded" />
            <button className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg mb-3">Create Task</h2>
          <form onSubmit={createTask} className="space-y-2">
            <input placeholder="Title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full p-2 border rounded" />
            <input placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full p-2 border rounded" />
            <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} className="w-full p-2 border rounded">
              <option value="">-- assign to --</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
            </select>
            <button className="bg-green-600 text-white px-4 py-2 rounded">Create Task</button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Employees ({employees.length})</h3>
          <ul className="space-y-1 text-sm max-h-96 overflow-y-auto">
            {employees.map(e => (
              <li key={e.id || e._id} className="flex justify-between items-center p-1 hover:bg-gray-50 border-b border-gray-100">
                <span>
                  {e.name} — {e.email}
                  {!e.client && <span className="text-red-500 text-xs ml-1 font-bold">(No Client)</span>}
                </span>
                <button onClick={() => deleteEmployee(e.id || e._id)} className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-2 py-0.5 rounded">Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Tasks</h3>
          <ul className="list-disc pl-5 text-sm">
            {tasks.map(t => <li key={t.id}>{t.title} — assigned: {t.assigned?.name || t.assignedTo || 'none'}</li>)}
          </ul>
        </div>
      </div>

      {msg && <div className="mt-4 p-3 bg-blue-50 rounded">{msg}</div>}
    </div>
  );
};

export default DevTools;
