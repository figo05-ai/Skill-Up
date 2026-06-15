import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';

const jobTitleOptions = [
  { value: 'HELPERS', label: 'HELPERS' },
  { value: 'أخصائي إدارة مشاريع', label: 'أخصائي إدارة مشاريع' },
  { value: 'أخصائي إداري', label: 'أخصائي إداري' },
  { value: 'أخصائي استشارات أعمال', label: 'أخصائي استشارات أعمال' },
  { value: 'أخصائي اعلامي', label: 'أخصائي اعلامي' },
  { value: 'أخصائي التزام', label: 'أخصائي التزام' },
  { value: 'أخصائي تحليل مالي', label: 'أخصائي تحليل مالي' },
  { value: 'أخصائي تدريب وتطوير موارد بشرية', label: 'أخصائي تدريب وتطوير موارد بشرية' },
  { value: 'أخصائي تسويق', label: 'أخصائي تسويق' },
  { value: 'أخصائي تطوير إداري', label: 'أخصائي تطوير إداري' },
  { value: 'أخصائي توظيف', label: 'أخصائي توظيف' },
  { value: 'أخصائي جودة', label: 'أخصائي جودة' },
  { value: 'أخصائي خدمة عملاء', label: 'أخصائي خدمة عملاء' },
  { value: 'أخصائي عقود', label: 'أخصائي عقود' },
  { value: 'أخصائي علاقات عامة', label: 'أخصائي علاقات عامة' },
  { value: 'أخصائي علوم حاسب آلي', label: 'أخصائي علوم حاسب آلي' },
  { value: 'أخصائي عمليات موارد بشرية', label: 'أخصائي عمليات موارد بشرية' },
  { value: 'أخصائي قانوني', label: 'أخصائي قانوني' },
  { value: 'أخصائي مبيعات', label: 'أخصائي مبيعات' },
  { value: 'أخصائي مراقبة مخزون', label: 'أخصائي مراقبة مخزون' },
  { value: 'أخصائي مراقبة موارد بشرية', label: 'أخصائي مراقبة موارد بشرية' },
  { value: 'أخصائي مستودعات', label: 'أخصائي مستودعات' },
  { value: 'أخصائي مشاريع', label: 'أخصائي مشاريع' },
  { value: 'أخصائي مشتريات', label: 'أخصائي مشتريات' },
  { value: 'أخصائي مكتبات', label: 'أخصائي مكتبات' },
  { value: 'أخصائي موازنة مالية', label: 'أخصائي موازنة مالية' },
  { value: 'أمين صندوق', label: 'أمين صندوق' },
  { value: 'أمين مخزن', label: 'أمين مخزن' },
  { value: 'أمين مستودع فني', label: 'أمين مستودع فني' },
  { value: 'إداري', label: 'إداري' },
  { value: 'إداري عام', label: 'إداري عام' },
  { value: 'إداري مواقع إلكترونية', label: 'إداري مواقع إلكترونية' },
  { value: 'اختصاصي تسويق', label: 'اختصاصي تسويق' },
  { value: 'اخصائى مشتريات', label: 'اخصائى مشتريات' },
  { value: 'اخصائي إدارة خدمات', label: 'اخصائي إدارة خدمات' },
  { value: 'اخصائي استشارات اعمال', label: 'اخصائي استشارات اعمال' },
  { value: 'اخصائي تأمين', label: 'اخصائي تأمين' },
  { value: 'اخصائي توظيف', label: 'اخصائي توظيف' },
  { value: 'اخصائي خدمات عملاء', label: 'اخصائي خدمات عملاء' },
  { value: 'اخصائي خدمة عملاء', label: 'اخصائي خدمة عملاء' },
  { value: 'اخصائي خدمه عملاء', label: 'اخصائي خدمه عملاء' },
  { value: 'اخصائي دعم فني', label: 'اخصائي دعم فني' },
  { value: 'اخصائي عقود', label: 'اخصائي عقود' },
  { value: 'اخصائي علاقات عامة', label: 'اخصائي علاقات عامة' },
  { value: 'اخصائي عمليات موارد بشرية', label: 'اخصائي عمليات موارد بشرية' },
  { value: 'اخصائي قانوني', label: 'اخصائي قانوني' },
  { value: 'اخصائي مبيعات', label: 'اخصائي مبيعات' },
  { value: 'اخصائي مراقبة مخزون', label: 'اخصائي مراقبة مخزون' },
  { value: 'اخصائي مراقبة موارد بشرية', label: 'اخصائي مراقبة موارد بشرية' },
  { value: 'اخصائي مشاريع', label: 'اخصائي مشاريع' },
  { value: 'اخصائي مشتريات', label: 'اخصائي مشتريات' },
  { value: 'اداري عام', label: 'اداري عام' },
  { value: 'اداري مواقع الكترونيه', label: 'اداري مواقع الكترونيه' },
  { value: 'اعمال ادارية', label: 'اعمال ادارية' },
  { value: 'بائع', label: 'بائع' },
  { value: 'بائع عطور', label: 'بائع عطور' },
  { value: 'بائع هاتفي', label: 'بائع هاتفي' },
  { value: 'تسويق', label: 'تسويق' },
  { value: 'جامع بيانات', label: 'جامع بيانات' },
  { value: 'حارس أمن', label: 'حارس أمن' },
  { value: 'خدمة العملاء', label: 'خدمة العملاء' },
  { value: 'خدمة عملاء', label: 'خدمة عملاء' },
  { value: 'رئيس مجلس إدارة', label: 'رئيس مجلس إدارة' },
  { value: 'رسام خرائط', label: 'رسام خرائط' },
  { value: 'رسام هندسي', label: 'رسام هندسي' },
  { value: 'سائق سيارة', label: 'سائق سيارة' },
  { value: 'سائق سيارة أجرة', label: 'سائق سيارة أجرة' },
  { value: 'سائق شاحنة صغيرة', label: 'سائق شاحنة صغيرة' },
  { value: 'سكرتير', label: 'سكرتير' },
  { value: 'سكرتير تنفيذي', label: 'سكرتير تنفيذي' },
  { value: 'ضابط علاقات عامة', label: 'ضابط علاقات عامة' },
  { value: 'عامل تصنيع', label: 'عامل تصنيع' },
  { value: 'عامل تعبئة رفوف', label: 'عامل تعبئة رفوف' },
  { value: 'علاقات عامة', label: 'علاقات عامة' },
  { value: 'فني تدفئة وتهوية وتكييف', label: 'فني تدفئة وتهوية وتكييف' },
  { value: 'فني تصميم داخلي', label: 'فني تصميم داخلي' },
  { value: 'فني تصميم معارض', label: 'فني تصميم معارض' },
  { value: 'فني دعم برامج', label: 'فني دعم برامج' },
  { value: 'فني سلامة وصحة مهنية', label: 'فني سلامة وصحة مهنية' },
  { value: 'فني صيانة آلات كهربائية', label: 'فني صيانة آلات كهربائية' },
  { value: 'فني كهرباء', label: 'فني كهرباء' },
  { value: 'فني مدني', label: 'فني مدني' },
  { value: 'فني مساحة', label: 'فني مساحة' },
  { value: 'فني ميكانيكي', label: 'فني ميكانيكي' },
  { value: 'فني نظم حاسب آلي', label: 'فني نظم حاسب آلي' },
  { value: 'فني نظم معلومات', label: 'فني نظم معلومات' },
  { value: 'كاتب', label: 'كاتب' },
  { value: 'كاتب إداري عام', label: 'كاتب إداري عام' },
  { value: 'كاتب اتصال', label: 'كاتب اتصال' },
  { value: 'كاتب اتصالات', label: 'كاتب اتصالات' },
  { value: 'كاتب اختزال', label: 'كاتب اختزال' },
  { value: 'كاتب ادارى عام', label: 'كاتب ادارى عام' },
  { value: 'كاتب اداري', label: 'كاتب اداري' },
  { value: 'كاتب اداري عام', label: 'كاتب اداري عام' },
  { value: 'كاتب ادخال بيانات', label: 'كاتب ادخال بيانات' },
  { value: 'كاتب استعلامات', label: 'كاتب استعلامات' },
  { value: 'كاتب استعلامات خدمة عملاء', label: 'كاتب استعلامات خدمة عملاء' },
  { value: 'كاتب استعلامات مركز خدمة عملاء', label: 'كاتب استعلامات مركز خدمة عملاء' },
  { value: 'كاتب استقبال خدمة عملاء', label: 'كاتب استقبال خدمة عملاء' },
  { value: 'كاتب موارد بشرية', label: 'كاتب موارد بشرية' },
  { value: 'كاتب مراسلات', label: 'كاتب مراسلات' },
  { value: 'محصل', label: 'محصل' },
  { value: 'مساعد إداري', label: 'مساعد إداري' },
  { value: 'مندوب مبيعات', label: 'مندوب مبيعات' },
  { value: 'مندوب مشتريات', label: 'مندوب مشتريات' },
  { value: 'مراقب عام', label: 'مراقب عام' },
  { value: 'اخصائي استقدام', label: 'اخصائي استقدام' },
  { value: 'مترجم', label: 'مترجم' },
  { value: 'مهندس', label: 'مهندس' },
  { value: 'محاسب', label: 'محاسب' },
  { value: 'موظف استقبال', label: 'موظف استقبال' },
  { value: 'مدخل بيانات', label: 'مدخل بيانات' },
  { value: 'مدير تطوير موارد بشرية', label: 'مدير تطوير موارد بشرية' },
  { value: 'كاتب بيانات عملاء', label: 'كاتب بيانات عملاء' },
  { value: 'كاتب حسابات', label: 'كاتب حسابات' },
  { value: 'كاتب رواتب', label: 'كاتب رواتب' },
  { value: 'مدير تخطيط قوى عاملة', label: 'مدير تخطيط قوى عاملة' },
  { value: 'مدير مكتب', label: 'مدير مكتب' },
  { value: 'مدير مالي', label: 'مدير مالي' },
  { value: 'مدير إداري', label: 'مدير إداري' },
  { value: 'أخصائي تخطيط قوى عاملة', label: 'أخصائي تخطيط قوى عاملة' },
  { value: 'أخصائي أداء مؤسسي', label: 'أخصائي أداء مؤسسي' },
  { value: 'مشرف مكتب', label: 'مشرف مكتب' },
  { value: 'موظف علاقات عامه', label: 'موظف علاقات عامه' },
  { value: 'كاتب علاقات حكومية (مندوب تعقيب)', label: 'كاتب علاقات حكومية (مندوب تعقيب)' },
  { value: 'كاتب علاقات حكومية', label: 'كاتب علاقات حكومية' },
  { value: 'كاتب إنتاج', label: 'كاتب إنتاج' },
  { value: 'كاتب تدقيق بيانات', label: 'كاتب تدقيق بيانات' },
  { value: 'كاتب حفظ ملفات', label: 'كاتب حفظ ملفات' },
  { value: 'كاتب حركة مخزون', label: 'كاتب حركة مخزون' },
  { value: 'فني صحة عامة', label: 'فني صحة عامة' },
  { value: 'محلل بيانات', label: 'محلل بيانات' },
  { value: 'كاتب بريدي', label: 'كاتب بريدي' },
  { value: 'كاتب سجل', label: 'كاتب سجل' },
  { value: 'مدبر إداري', label: 'مدبر إداري' },
  { value: 'موظف إداري مبتدئ', label: 'موظف إداري مبتدئ' },
  { value: 'كاتب عام', label: 'كاتب عام' },
  { value: 'كيميائي', label: 'كيميائي' },
  { value: 'أخصائي مختبر', label: 'أخصائي مختبر' },
  { value: 'فني جودة', label: 'فني جودة' },
  { value: 'موظف إداري مبتدئ', label: 'موظف إداري مبتدئ' },
  { value: 'كاتب عام', label: 'كاتب عام' },
  { value: 'كيميائي', label: 'كيميائي' },
  { value: 'أخصائي مختبر', label: 'أخصائي مختبر' },
  { value: 'فني جودة', label: 'فني جودة' },
  { value: 'الثانوية العامة', label: 'الثانوية العامة' },
  { value: 'بكالوريوس تخصص الكيمياء', label: 'بكالوريوس تخصص الكيمياء' },
  { value: 'بكالوريوس تخصص الكیمیاء', label: 'بكالوريوس تخصص الكیمیاء' },
  { value: 'بكلوریوس - منتظمة تخصص المحسبة', label: 'بكلوریوس - منتظمة تخصص المحسبة' },
  { value: 'فني ميكانيكي محركات', label: 'فني ميكانيكي محركات' },
  { value: 'مهندس مدني', label: 'مهندس مدني' },
  { value: 'مهندس ميكانيكي', label: 'مهندس ميكانيكي' },
  { value: 'فني كهربائي أنظمة حماية كهربائية', label: 'فني كهربائي أنظمة حماية كهربائية' },
  { value: 'فني أجهزة إلكترونية', label: 'فني أجهزة إلكترونية' },
  { value: 'فني ميكانيكي مركبات', label: 'فني ميكانيكي مركبات' },
  { value: 'مهندس إدارة مشاريع', label: 'مهندس إدارة مشاريع' },
  { value: 'مهندس معماري', label: 'مهندس معماري' },
  { value: 'فني كهربائي شبكات توزيع أرضية', label: 'فني كهربائي شبكات توزيع أرضية' },
  { value: 'فني علوم أغذية', label: 'فني علوم أغذية' },
  { value: 'فني دعم تقنية معلومات (IT Support)', label: 'فني دعم تقنية معلومات (IT Support)' },
  { value: 'فني دعم تقنية معلومات', label: 'فني دعم تقنية معلومات' },
  { value: 'مهندس شبكات', label: 'مهندس شبكات' },
  { value: 'فني صيانة أجهزة كهربائية', label: 'فني صيانة أجهزة كهربائية' },
  { value: 'مدير مبيعات تجزئة', label: 'مدير مبيعات تجزئة' },
  { value: 'مدير عام', label: 'مدير عام' },
  { value: 'مدير عمليات هندسة صناعية', label: 'مدير عمليات هندسة صناعية' },
  { value: 'مدير تدريب', label: 'مدير تدريب' },
  { value: 'مدير علاقات عامة', label: 'مدير علاقات عامة' },
  { value: 'مدير مصنع', label: 'مدير مصنع' },
  { value: 'مدير توظيف', label: 'مدير توظيف' },
];

const BAR_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'];

const CompanyDetails = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const { id } = useParams(); // نفترض أن الرابط هو /companies/:id
  const [client, setClient] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmpIds, setSelectedEmpIds] = useState({});
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'error' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  
  const [undoData, setUndoData] = useState(null);
  const undoTimerRef = useRef(null);
  const undoCommitRef = useRef(null);

  useEffect(() => {
    if (alertModal.show && alertModal.type === 'success') {
      const timer = setTimeout(() => {
        setAlertModal(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertModal.show, alertModal.type]);

  // تنفيذ الحذف المعلق عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (undoCommitRef.current) {
        undoCommitRef.current();
      }
    };
  }, []);

  // حالات البحث
  const [searchName, setSearchName] = useState('');
  const [searchJobTitle, setSearchJobTitle] = useState('');
  const [searchIdentity, setSearchIdentity] = useState('');

  // حالات التعديل
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // جلب بيانات الشركة
        const clientRes = await api.get('/clients');
        const currentClient = clientRes.data.find(c => String(c.id || c._id) === String(id));
        setClient(currentClient);

        // جلب الموظفين وتصفيتهم لهذه الشركة
        const empRes = await api.get('/employees');
        setAllEmployees(empRes.data);
        const clientEmployees = empRes.data.filter(e => {
          const eClientId = e.client?.id || e.client?._id || e.client;
          return String(eClientId) === String(id);
        });
        
        setEmployees(clientEmployees);
      } catch (err) {
        console.error("Error fetching company details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // منطق البحث المتعدد
  const filteredEmployees = React.useMemo(() => {
    return employees.filter(emp => {
      const nameMatch = emp.name.toLowerCase().includes(searchName.toLowerCase());
      const jobMatch = (emp.jobTitle || '').toLowerCase().includes(searchJobTitle.toLowerCase());
      const identityMatch = (emp.identityNumber || '').includes(searchIdentity);
      
      return nameMatch && jobMatch && identityMatch;
    });
  }, [searchName, searchJobTitle, searchIdentity, employees]);

  const handleCheckboxChange = (id) => {
    setSelectedEmpIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = { ...selectedEmpIds };
      filteredEmployees.forEach(e => all[e.id || e._id] = true);
      setSelectedEmpIds(all);
    } else {
      const newSelected = { ...selectedEmpIds };
      filteredEmployees.forEach(e => delete newSelected[e.id || e._id]);
      setSelectedEmpIds(newSelected);
    }
  };

  const executePendingDelete = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    if (undoCommitRef.current) {
      undoCommitRef.current();
      undoCommitRef.current = null;
    }
    setUndoData(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    
    executePendingDelete();

    const empToDelete = employees.find(e => (e.id || e._id) === id);
    setEmployees(prev => prev.filter(e => (e.id || e._id) !== id));

    const commit = async () => {
      try {
        await api.delete(`/employees/${id}`);
      } catch (err) {
        console.error(err);
        setAlertModal({ show: true, message: t('errorDeleting') || "Error deleting", type: 'error' });
        setEmployees(prev => [...prev, empToDelete]);
      }
      setUndoData(null);
      undoCommitRef.current = null;
    };

    undoCommitRef.current = commit;
    undoTimerRef.current = setTimeout(commit, 1500);
    setUndoData({ items: [empToDelete] });
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selectedEmpIds).filter(k => selectedEmpIds[k]);
    if (ids.length === 0) return;
    if (!window.confirm(t('confirmDelete'))) return;
    
    executePendingDelete();

    const empsToDelete = employees.filter(e => selectedEmpIds[e.id || e._id]);
    setEmployees(prev => prev.filter(e => !selectedEmpIds[e.id || e._id]));
    setSelectedEmpIds({});

    const commit = async () => {
      try {
        await Promise.all(ids.map(id => api.delete(`/employees/${id}`)));
      } catch (err) {
        console.error(err);
        setAlertModal({ show: true, message: "Error deleting selected items", type: 'error' });
        setEmployees(prev => [...prev, ...empsToDelete]);
      }
      setUndoData(null);
      undoCommitRef.current = null;
    };

    undoCommitRef.current = commit;
    undoTimerRef.current = setTimeout(commit, 1500);
    setUndoData({ items: empsToDelete });
  };

  const handleUndo = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    undoCommitRef.current = null;
    
    if (undoData) {
      setEmployees(prev => [...prev, ...undoData.items]);
      setUndoData(null);
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: String(employee.phone || '').slice(0, 10),
      jobTitle: employee.jobTitle || '',
      nationality: employee.nationality || '',
      identityNumber: String(employee.identityNumber || '').slice(0, 10),
      joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
      contractNumber: employee.contractNumber || '',
      status: employee.status || 'active',
      holidays: employee.holidays || 8,
      monthlyWorkHours: employee.monthlyWorkHours || 176,
      attendancePercentage: employee.attendancePercentage || 100,
      absentDays: employee.absentDays || 0,
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => {
      let newValue = type === 'checkbox' ? checked : value;

      if (name === 'phone' || name === 'identityNumber') {
        newValue = value.replace(/\D/g, '').slice(0, 10);
      } else if (type === 'number') {
        newValue = value === '' ? '' : Number(value);
      }

      const newFormData = { ...prev, [name]: newValue };

      if (name === 'holidays') newFormData.monthlyWorkHours = (30 - Number(newValue)) * 8;
      return newFormData;
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const phone = String(formData.phone || '').trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      setAlertModal({ show: true, message: `رقم الهاتف يجب أن يتكون من 10 أرقام (الحالي: ${phone.length})`, type: 'error' });
      return;
    }

    const identityNumber = String(formData.identityNumber || '').trim();
    if (identityNumber && !/^\d{10}$/.test(identityNumber)) {
      setAlertModal({ show: true, message: `رقم الهوية يجب أن يتكون من 10 أرقام (الحالي: ${identityNumber.length})`, type: 'error' });
      return;
    }

    if (identityNumber) {
      const isDuplicate = allEmployees.some(emp => 
        String(emp.identityNumber || '') === identityNumber && 
        (emp.id || emp._id) !== (editingEmployee.id || editingEmployee._id)
      );
      if (isDuplicate) {
        setAlertModal({ show: true, message: 'رقم الهوية مسجل مسبقاً لموظف آخر', type: 'error' });
        return;
      }
    }

    try {
      const res = await api.put(`/employees/${editingEmployee.id || editingEmployee._id}`, formData);
      // تحديث القائمة المحلية
      setEmployees(prev => prev.map(emp => (emp.id || emp._id) === (editingEmployee.id || editingEmployee._id) ? res.data.employee : emp));
      setAllEmployees(prev => prev.map(emp => (emp.id || emp._id) === (editingEmployee.id || editingEmployee._id) ? res.data.employee : emp));
      setEditingEmployee(null);
      setAlertModal({ show: true, message: t('successUpdate') || 'تم التحديث بنجاح', type: 'success' });
    } catch (err) {
      console.error("Update failed", err);
      setAlertModal({ show: true, message: "فشل التحديث: " + (err.response?.data?.message || err.message), type: 'error' });
    }
  };

  // إعداد بيانات الرسوم البيانية
  const statusData = [
    { name: t('active'), value: employees.filter(e => e.status === 'active').length, color: '#10b981' },
    { name: t('remote'), value: employees.filter(e => e.status === 'remote').length, color: '#3b82f6' },
    { name: t('inactive'), value: employees.filter(e => e.status === 'inactive').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const jobTitleCounts = employees.reduce((acc, curr) => {
    const title = curr.jobTitle || t('other');
    acc[title] = (acc[title] || 0) + 1;
    return acc;
  }, {});

  const jobTitleData = Object.entries(jobTitleCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const handleExportExcel = () => {
    const data = filteredEmployees.map(emp => ({
      [t('name')]: emp.name,
      [t('jobTitle')]: emp.jobTitle,
      [t('identity')]: emp.identityNumber,
      [t('phone')]: emp.phone,
      [t('joiningDate')]: emp.joiningDate ? format(new Date(emp.joiningDate), 'yyyy-MM-dd') : '',
      [t('status')]: t(emp.status) || emp.status,
      [t('email')]: emp.email
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, `${client.name}_Employees.xlsx`);
  };

  // حسابات تقسيم الصفحات (Pagination)
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  if (loading) return <div className="p-6">{t('loading')}</div>;
  if (!client) return <div className="p-6">{t('noData')}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ترويسة الصفحة مع زر الإضافة */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {client.name}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {t('companyEmployees')} ({filteredEmployees.length})
          </p>
        </div>
        <div className="flex gap-3">
        {Object.values(selectedEmpIds).filter(Boolean).length > 0 && (
          <button 
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 font-bold flex items-center gap-2"
          >
            {t('delete')} ({Object.values(selectedEmpIds).filter(Boolean).length})
          </button>
        )}
        <button 
          onClick={handleExportExcel}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          {t('exportExcel')}
        </button>
        {/* زر إضافة موظف ينقل لصفحة الموظفين مع تمرير الشركة المختارة */}
        <Link 
          to="/employees" 
          state={{ selectedClientId: client.id || client._id }}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-bold flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('addEmployee')}
        </Link>
        </div>
      </div>

      {/* قسم الإحصائيات والرسوم البيانية */}
      {employees.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* رسم بياني لتوزيع الحالات */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employeeStatusDistribution')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* رسم بياني لتوزيع المسميات الوظيفية */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('jobTitleDistribution')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobTitleData} layout="vertical" margin={{ top: 5, right: isRTL ? 0 : 10, left: isRTL ? 10 : 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" reversed={isRTL} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={220} 
                    tick={{
                      fontSize: 11, 
                      fill: '#000000', 
                      fontWeight: 'bold',
                      textAnchor: isRTL ? 'end' : 'end',
                      dx: isRTL ? 10 : -10
                    }} 
                    interval={0} 
                    orientation={isRTL ? "right" : "left"} 
                    yAxisId="titles" 
                  />
                  <YAxis 
                    orientation={isRTL ? "left" : "right"} 
                    yAxisId="values" 
                    dataKey="value" 
                    type="category" 
                    width={50} 
                    tick={{
                      fontSize: 12, 
                      fontWeight: 'bold', 
                      fill: '#374151',
                      textAnchor: isRTL ? 'start' : 'start',
                      dx: isRTL ? -10 : 10
                    }} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0} 
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={isRTL ? [4, 0, 0, 4] : [0, 4, 4, 0]} barSize={20} yAxisId="titles">
                    {jobTitleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* خانات البحث الثلاثة */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* بحث بالاسم */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('name')}</label>
          <input 
            type="text" 
            value={searchName} 
            onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }} 
            placeholder={t('searchNamePlaceholder')}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
          />
        </div>
        
        {/* بحث بالمسمى الوظيفي */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('jobTitle')}</label>
          <input 
            type="text" 
            value={searchJobTitle} 
            onChange={(e) => { setSearchJobTitle(e.target.value); setCurrentPage(1); }} 
            placeholder={t('searchJobTitlePlaceholder')}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
          />
        </div>

        {/* بحث برقم الهوية */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('identity')}</label>
          <input 
            type="text" 
            value={searchIdentity} 
            onChange={(e) => { setSearchIdentity(e.target.value); setCurrentPage(1); }} 
            placeholder={t('searchIdentityPlaceholder')}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* جدول الموظفين */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 text-sm uppercase tracking-wider">
              <th className="p-3 border-r text-center w-20">
                <div className="flex flex-col items-center justify-center gap-2">
                  <label className="text-[10px] flex items-center gap-1 cursor-pointer mb-0" title={language === 'ar' ? 'تحديد كل الموظفين في البحث' : 'Select all in search'}>
                    <input type="checkbox" onChange={handleSelectAll} checked={filteredEmployees.length > 0 && filteredEmployees.every(e => selectedEmpIds[e.id || e._id])} />
                    <span>{language === 'ar' ? 'الكل' : 'All'}</span>
                  </label>
                  <label className="text-[10px] flex items-center gap-1 cursor-pointer text-emerald-600 mb-0" title={language === 'ar' ? 'تحديد موظفي هذه الصفحة فقط' : 'Select this page only'}>
                    <input type="checkbox" onChange={handleSelectPage} checked={paginatedEmployees.length > 0 && paginatedEmployees.every(e => selectedEmpIds[e.id || e._id])} />
                    <span>{language === 'ar' ? 'الصفحة' : 'Page'}</span>
                  </label>
                </div>
              </th>
              <th className="p-3 border-r">{t('name')}</th>
              <th className="p-3 border-r">{t('jobTitle')}</th>
              <th className="p-3 border-r">{t('identity')}</th>
              <th className="p-3 border-r">{t('phone')}</th>
              <th className="p-3 border-r">{t('joiningDate')}</th>
              <th className="p-3 text-center">{t('status')}</th>
              <th className="p-3 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp) => (
                <tr key={emp.id || emp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 border-r border-gray-50 text-center">
                    <input 
                      type="checkbox" 
                      checked={!!selectedEmpIds[emp.id || emp._id]} 
                      onChange={() => handleCheckboxChange(emp.id || emp._id)} 
                    />
                  </td>
                  <td className="p-4 border-r border-gray-50 font-medium text-gray-800">{emp.name}</td>
                  <td className="p-4 border-r border-gray-50 text-gray-600">{emp.jobTitle || '-'}</td>
                  <td className="p-4 border-r border-gray-50 text-gray-600 font-mono text-sm">{emp.identityNumber || '-'}</td>
                  <td className="p-4 border-r border-gray-50 text-gray-600" dir="ltr">{emp.phone || '-'}</td>
                  <td className="p-4 border-r border-gray-50 text-gray-600">
                    {emp.joiningDate ? format(new Date(emp.joiningDate), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      emp.status === 'active' ? 'bg-green-100 text-green-700' : 
                      emp.status === 'remote' ? 'bg-blue-100 text-blue-700' : 
                      emp.status === 'inactive' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {t(emp.status) || emp.status}
                    </span>
                  </td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button onClick={() => handleEditClick(emp)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title={t('edit')}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(emp.id || emp._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title={t('delete')}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">{t('noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-4">
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

      {/* Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{t('editEmployee')}</h2>
              <button onClick={() => setEditingEmployee(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('name')}</label>
                <input name="name" value={formData.name} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('email')}</label>
                <input name="email" value={formData.email} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('phone')}</label>
                <input name="phone" value={formData.phone} onChange={handleFormChange} maxLength={10} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('jobTitle')}</label>
                <select name="jobTitle" value={formData.jobTitle} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none">
                  <option value="">{t('jobTitle')}</option>
                  {jobTitleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('nationality')}</label>
                <input name="nationality" value={formData.nationality} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('identityNumber')}</label>
                <input name="identityNumber" value={formData.identityNumber} onChange={handleFormChange} maxLength={10} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('holidays')}</label>
                <input type="number" name="holidays" value={formData.holidays} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('monthlyWorkHours')}</label>
                <input type="number" name="monthlyWorkHours" value={formData.monthlyWorkHours} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('absentDays')}</label>
                <input type="number" name="absentDays" value={formData.absentDays} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('joiningDate')}</label>
                <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('status')}</label>
                <select name="status" value={formData.status} onChange={handleFormChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none">
                  <option value="active">{t('active')}</option>
                  <option value="remote">{t('remote')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-2 pt-4 flex justify-end gap-3 border-t mt-2">
                <button type="button" onClick={() => setEditingEmployee(null)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">{t('close')}</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200">{t('saveChanges')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {undoData && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-4 z-[70] animate-bounce-in">
          <span>{t('itemDeleted')} ({undoData.items.length})</span>
          <button onClick={handleUndo} className="text-yellow-400 font-bold hover:text-yellow-300 underline">
            {t('undo')}
          </button>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn transform transition-all scale-100">
            <div className={`p-4 border-b flex items-center gap-3 ${alertModal.type === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              {alertModal.type === 'success' ? (
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
              )}
              <h3 className={`font-bold text-lg ${alertModal.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {alertModal.type === 'success' ? (t('success') || 'تم بنجاح') : (t('error') || 'تنبيه')}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-lg leading-relaxed">{alertModal.message}</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button onClick={() => setAlertModal({ ...alertModal, show: false })} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">{t('close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetails;