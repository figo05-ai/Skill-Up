import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import logo from '../assets/logo.jpeg';

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
<<<<<<< HEAD
  { value: 'أخصائي أمن بيانات', label: 'أخصائي أمن بيانات' },
  { value: 'مراقب حركة مركبات', label: 'مراقب حركة مركبات' },
  { value: 'مراسل', label: 'مراسل' },
];

=======
];

// قاموس لتصحيح الأخطاء الإملائية الشائعة في الإكسل تلقائياً قبل الحفظ
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
const TYPO_CORRECTIONS = {
  'مساعداداري': 'مساعد إداري',
  'مساعد اداري': 'مساعد إداري',
  'اخصائى مشتريات': 'أخصائي مشتريات',
  'مساعداداري ': 'مساعد إداري'
};

const EmployeeList = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    jobTitle: '',
    nationality: '',
    joiningDate: '',
    status: 'active',
    attendancePercentage: 0,
    client: '',
    identityNumber: '',
    absentDays: 0
  });
  const [importMode, setImportMode] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [showJobTitleList, setShowJobTitleList] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'error' });
  const [clientSearch, setClientSearch] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importErrorsData, setImportErrorsData] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const cancelImportRef = useRef(false);

  useEffect(() => {
    if (alertModal.show && alertModal.type === 'success') {
      const timer = setTimeout(() => {
        setAlertModal(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertModal.show, alertModal.type]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      const sortedClients = res.data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setClients(sortedClients);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchClients();
  }, []);

  useEffect(() => {
    if (location.state?.selectedClientId) {
      setForm(prev => ({ ...prev, client: location.state.selectedClientId }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => {
      let newValue = value;
      if (name === 'phone' || name === 'identityNumber') {
        newValue = value.replace(/\D/g, '').slice(0, 10);
      } else if (type === 'number') {
        newValue = value === '' ? '' : Number(value);
      }
      return { ...prev, [name]: newValue };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const phone = String(form.phone || '').trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      setAlertModal({ show: true, message: `رقم الهاتف يجب أن يتكون من 10 أرقام (الحالي: ${phone.length})`, type: 'error' });
      return;
    }

    const identityNumber = String(form.identityNumber || '').trim();
    if (identityNumber && !/^\d{10}$/.test(identityNumber)) {
      setAlertModal({ show: true, message: `رقم الهوية يجب أن يتكون من 10 أرقام (الحالي: ${identityNumber.length})`, type: 'error' });
      return;
    }

    if (identityNumber && employees.some(e => String(e.identityNumber || '') === identityNumber)) {
      setAlertModal({ show: true, message: 'رقم الهوية مسجل مسبقاً لموظف آخر', type: 'error' });
      return;
    }

    try {
      await api.post('/employees', { ...form, password: '123456' });
      setForm({ 
        name: '', 
        email: '', 
        phone: '',
        jobTitle: '',
        nationality: '',
        joiningDate: '',
        status: 'active',
        attendancePercentage: 0,
        client: '',
        identityNumber: '',
        absentDays: 0
      });
      fetchEmployees();
      setAlertModal({ show: true, message: t('successCreate') || 'تم إضافة الموظف بنجاح', type: 'success' });
    } catch (err) {
      console.error(err);
      // prefer message, otherwise show validation errors array, otherwise whole response
      const resp = err.response?.data;
      let msg = 'Create failed';
      if (resp) {
        if (resp.message) msg = resp.message;
        else if (resp.errors && Array.isArray(resp.errors)) msg = resp.errors.map(e => e.msg || e.param || JSON.stringify(e)).join('; ');
        else msg = JSON.stringify(resp);
      } else if (err.message) msg = err.message;
      setAlertModal({ show: true, message: msg, type: 'error' });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json(ws);
      
      const formatted = json.map(row => {
        const cName = row['الشركة'] || row['Company'] || row['Client'] || row['العميل'] || row['clientName'];
        let foundClient = clients.find(c => c.name.trim() === (cName || '').trim());

        // If not found in Excel, use the selected client from the form
        if (!foundClient && form.client) {
          foundClient = clients.find(c => String(c.id || c._id) === String(form.client));
        }

        // معالجة التاريخ بشكل دقيق
        let jDate = row['تاريخ الالتحاق'] || row['Joining Date'] || row['joiningDate'] || null;
        let finalDate = null;

        if (jDate) {
          if (typeof jDate === 'number') {
             // معالجة الرقم التسلسلي من إكسل مع تصحيح فرق التوقيت
             // إضافة 12 ساعة لتجنب مشكلة اليوم السابق بسبب فروق التوقيت
             const date = new Date(Math.round((jDate - 25569) * 86400 * 1000) + (12 * 60 * 60 * 1000));
             if (!isNaN(date.getTime())) {
               finalDate = date.toISOString().split('T')[0];
             }
          } else if (typeof jDate === 'string') {
             // معالجة النصوص مثل "15/01/2026"
             // تحويل DD/MM/YYYY إلى YYYY-MM-DD
             const parts = jDate.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
             if (parts) {
               // parts[1] is day, parts[2] is month, parts[3] is year
               finalDate = `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
             } else {
               // محاولة قراءة التنسيق القياسي
               const d = new Date(jDate);
               if (!isNaN(d.getTime())) {
                 finalDate = d.toISOString().split('T')[0];
               }
             }
          } else if (jDate instanceof Date) {
             // إذا كانت المكتبة قد حولتها بالفعل لتاريخ
             // إضافة ساعات لتجنب مشكلة التوقيت عند التحويل لسترينج
             const d = new Date(jDate.getTime() + (12 * 60 * 60 * 1000));
             finalDate = d.toISOString().split('T')[0];
          }
        }

        // معالجة الحالة
        const rawStatus = row['حالة الموظف'] || row['Status'] || row['status'] || 'active';
        let status = 'active';
        if (rawStatus) {
          const s = String(rawStatus).trim().toLowerCase();
          if (s === 'عن بعد' || s === 'remote') status = 'remote';
          else if (s === 'غير نشط' || s === 'inactive') status = 'inactive';
        }

        // تصحيح الأخطاء الإملائية الشائعة للمسميات
        let parsedJobTitle = String(row['المسمى الوظيفي'] || row['Job Title'] || row['jobTitle'] || '').trim();
        if (TYPO_CORRECTIONS[parsedJobTitle]) {
          parsedJobTitle = TYPO_CORRECTIONS[parsedJobTitle];
        }

        return {
          name: row['الاسم'] || row['Name'] || row['name'],
          email: row['البريد الإلكتروني'] || row['Email'] || row['email'],
          phone: row['رقم الهاتف'] || row['Phone'] || row['phone'],
          jobTitle: parsedJobTitle,
          nationality: row['الجنسية'] || row['Nationality'] || row['nationality'],
          identityNumber: row['رقم الهوية'] || row['ID Number'] || row['identityNumber'],
          holidays: row['أيام العطلات'] || row['Holidays'] || row['holidays'] || 0,
          monthlyWorkHours: row['ساعات العمل'] || row['Work Hours'] || row['monthlyWorkHours'] || 176,
          attendancePercentage: row['الحضور (%)'] || row['Attendance %'] || row['attendancePercentage'] || 0,
          contractNumber: row['رقم العقد'] || row['Contract Number'] || row['contractNumber'],
          joiningDate: finalDate,
          password: row['كلمة المرور'] || row['Password'] || row['password'],
          client: foundClient ? (foundClient.id || foundClient._id) : null,
          clientName: foundClient ? foundClient.name : cName,
          status: status
        };
      }).filter(item => item.name && item.email);
      
      // التحقق من صحة البيانات (Validation)
      const validData = [];
      const errors = [];
      const invalidRows = [];

      formatted.forEach((row, index) => {
        const rowNum = index + 2; // رقم الصف في الإكسل تقريباً (باعتبار الصف الأول عناوين)
        const rowErrors = [];

        // 1. التحقق من رقم الهوية
        if (row.identityNumber) {
            // التحقق من الطول (10 أرقام)
            if (!/^\d{10}$/.test(row.identityNumber)) {
                rowErrors.push('رقم الهوية يجب أن يتكون من 10 أرقام');
            }
            // التحقق من التكرار في قاعدة البيانات
            if (employees.some(e => e.identityNumber === row.identityNumber)) {
                rowErrors.push('رقم الهوية مسجل مسبقاً لموظف آخر');
            }
            // التحقق من التكرار داخل الملف نفسه
            if (validData.some(e => e.identityNumber === row.identityNumber)) {
                rowErrors.push('رقم الهوية مكرر داخل الملف');
            }
        }

        // 2. التحقق من رقم الهاتف
        if (row.phone && !/^\d{10}$/.test(row.phone)) {
            rowErrors.push('رقم الهاتف يجب أن يتكون من 10 أرقام');
        }

        // 3. التحقق من البريد الإلكتروني
        if (row.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
                rowErrors.push(t('invalidEmail') || 'صيغة البريد الإلكتروني غير صحيحة');
            }
            if (employees.some(e => e.email === row.email)) {
                rowErrors.push(t('emailDuplicate') || 'البريد الإلكتروني مسجل مسبقاً');
            }
            if (validData.some(e => e.email === row.email)) {
                rowErrors.push('البريد الإلكتروني مكرر داخل الملف');
            }
        }

        if (rowErrors.length > 0) {
            errors.push(`${t('row')} ${rowNum} (${row.name}): ${rowErrors.join(' - ')}`);
            // إضافة سبب الخطأ للصف لتصديره
            invalidRows.push({ ...row, Error: rowErrors.join('; ') });
        } else {
            validData.push(row);
        }
      });

      setValidationErrors(errors);
      setImportErrorsData(invalidRows);
      setImportData(validData);
      setImportMode(true);
      setImportResults(null);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const processImport = async () => {
    setLoading(true);
    setImportProgress(0);
    setProcessedCount(0);
    cancelImportRef.current = false;
    
    const chunkSize = 50; // معالجة 50 صف في كل دفعة
    const total = importData.length;
    let successCount = 0;
    let allErrors = [];

    try {
      for (let i = 0; i < total; i += chunkSize) {
        if (cancelImportRef.current) {
          allErrors.push(t('importStopped'));
          break;
        }

        const chunk = importData.slice(i, i + chunkSize);
        try {
          const response = await api.post('/employees/bulk', { employees: chunk });
          successCount += (response.data.successCount || 0);
          if (response.data.errors && Array.isArray(response.data.errors)) {
            allErrors = [...allErrors, ...response.data.errors];
          }
        } catch (err) {
          console.error("Chunk import failed:", err);
          const errorMsg = err.response?.data?.message || err.message || 'Chunk failed';
          allErrors.push(`Batch ${Math.floor(i/chunkSize) + 1}: ${errorMsg}`);
        }
        
        setProcessedCount(Math.min(i + chunk.length, total));
        setImportProgress(Math.round(Math.min(100, ((i + chunk.length) / total) * 100)));
      }

      setImportResults({ success: successCount, errors: allErrors });
      if (successCount > 0) {
        fetchEmployees();
      }
    } catch (err) {
      console.error("Bulk import failed:", err);
      setImportResults({ success: successCount, errors: [...allErrors, err.message] });
    } finally {
      setLoading(false);
      setImportProgress(0);
      setProcessedCount(0);
      cancelImportRef.current = false;
    }
  };

  const handleCancelImport = () => {
    if (loading) {
      cancelImportRef.current = true;
    } else {
      setImportMode(false);
    }
  };

  const handleDownloadErrors = () => {
    const ws = XLSX.utils.json_to_sheet(importErrorsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "Import_Errors.xlsx");
  };

  const handlePrintSummary = () => {
    api.post('/auth/log', { action: 'PRINT_SUMMARY', details: 'Printed Employees Summary' }).catch(() => {});
    setIsPrinting(true);
  };

  useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPrinting]);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    .sort((a, b) => {
      const countA = employees.filter(e => String(e.client?.id || e.client?._id || e.client) === String(a.id || a._id)).length;
      const countB = employees.filter(e => String(e.client?.id || e.client?._id || e.client) === String(b.id || b._id)).length;
      return countB - countA;
    });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{t('employees')}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t('employeeManagementDesc')}</p>
        </div>
        <button 
          onClick={handlePrintSummary}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-xl hover:bg-gray-900 transition-all shadow-lg font-bold flex items-center gap-2"
        >
          {t('printSummary')}
        </button>
        <label className="bg-blue-600 text-white px-5 py-2.5 rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          {t('importExcel')}
          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileSelect} />
        </label>
      </div>

      {importMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('importReview')}</h2>
            
            {importResults ? (
              <div className="mb-4">
                <div className="p-4 bg-gray-100 rounded mb-4">
                  <p className="text-green-600 font-bold">{t('bulkSuccess')}: {importResults.success}</p>
                  {importResults.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600 font-bold">{t('importErrors')} ({importResults.errors.length}):</p>
                      <ul className="list-disc list-inside text-sm text-red-500">
                        {importResults.errors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
                <button onClick={() => { setImportMode(false); setImportData([]); setImportResults(null); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">{t('close')}</button>
              </div>
            ) : (
              <>
                {validationErrors.length > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-bold text-yellow-800 mb-2">{t('importErrors')} ({validationErrors.length})</h3>
                    <p className="text-sm text-yellow-700 mb-2">{t('importErrorsNote')}</p>
                    <ul className="list-disc list-inside text-sm text-yellow-600 max-h-32 overflow-y-auto">
                      {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                    <div className="mt-3">
                      <button onClick={handleDownloadErrors} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm font-bold flex items-center gap-2">
                        {t('downloadErrors')}
                      </button>
                    </div>
                  </div>
                )}

                <p className="mb-4">{t('importReady')} {importData.length}</p>
                <div className="overflow-x-auto mb-4 border rounded">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 border">{t('name')}</th>
                        <th className="p-2 border">{t('email')}</th>
                        <th className="p-2 border">{t('jobTitle')}</th>
                        <th className="p-2 border">{t('company')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 border">{row.name}</td>
                          <td className="p-2 border">{row.email}</td>
                          <td className="p-2 border">{row.jobTitle}</td>
                          <td className="p-2 border">{row.clientName || (row.client ? clients.find(c => (c.id || c._id) === row.client)?.name : '-')}</td>
                        </tr>
                      ))}
                      {importData.length > 5 && <tr><td colSpan="4" className="p-2 text-center text-gray-500">...</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={processImport} 
                    disabled={loading}
                    className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? t('processing') : t('confirmAndAdd')}
                  </button>
                  <button 
                    onClick={handleCancelImport} 
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    {loading ? t('stop') : t('cancel')}
                  </button>
                </div>
                {loading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                    <div className="flex justify-between text-xs mt-1 text-gray-600 px-1">
                      <span>{importProgress}%</span>
                      <span>{t('remaining')}: {importData.length - processedCount}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{t('addEmployee')}</h2>
          </div>
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('name')} <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} placeholder={t('fullNamePlaceholder')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('email')} <span className="text-red-500">*</span></label>
              <input name="email" value={form.email} onChange={handleChange} placeholder={t('emailPlaceholder')} type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('phone')}</label>
              <input name="phone" value={form.phone} onChange={handleChange} maxLength={10} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('jobTitle')}</label>
              <div className="relative">
                <input 
                  name="jobTitle" 
                  value={form.jobTitle} 
                  onChange={handleChange} 
                  onFocus={() => setShowJobTitleList(true)}
                  onBlur={() => setTimeout(() => setShowJobTitleList(false), 200)}
                  placeholder={t('jobTitle')} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
                  autoComplete="off"
                />
                {showJobTitleList && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {jobTitleOptions.filter(opt => opt.label.toLowerCase().includes((form.jobTitle || '').toLowerCase())).map(opt => (
                      <li key={opt.value} className="p-2 hover:bg-gray-100 cursor-pointer text-sm" onMouseDown={() => { setForm(prev => ({ ...prev, jobTitle: opt.value })); setShowJobTitleList(false); }}>
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('nationality')}</label>
              <input name="nationality" value={form.nationality} onChange={handleChange} placeholder={t('nationality')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('identityNumber')}</label>
              <input name="identityNumber" value={form.identityNumber} onChange={handleChange} maxLength={10} placeholder={t('identityNumber')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('joiningDate')}</label>
              <input name="joiningDate" value={form.joiningDate} onChange={handleChange} type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('company')}</label>
              <select name="client" value={form.client} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                <option value="">{t('selectClientFirst')}</option>
                {clients.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('status')}</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                <option value="active">{t('active')}</option>
                <option value="remote">{t('remote')}</option>
                <option value="inactive">{t('inactive')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('attendancePercentage')}</label>
              <input name="attendancePercentage" value={form.attendancePercentage} onChange={handleChange} type="number" min="0" max="100" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('absentDays')}</label>
              <input name="absentDays" value={form.absentDays} onChange={handleChange} type="number" min="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 mt-2">
              <button type="submit" className="w-full bg-emerald-600 text-white px-6 py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-bold flex justify-center items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t('addEmployee')}
              </button>
            </div>
          </form>
        </div>

      {/* Client Search */}
      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder={t('searchClientPlaceholder')} 
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
          className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Company Summary Cards (Boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {filteredClients.length > 0 ? (
          filteredClients.map(client => {
          const count = employees.filter(e => String(e.client?.id || e.client?._id || e.client) === String(client.id || client._id)).length;
          const activeCount = employees.filter(e => String(e.client?.id || e.client?._id || e.client) === String(client.id || client._id) && e.status === 'active').length;
          const remoteCount = employees.filter(e => String(e.client?.id || e.client?._id || e.client) === String(client.id || client._id) && e.status === 'remote').length;
          const inactiveCount = count - activeCount - remoteCount;
          const chartData = [
            { name: t('active'), value: activeCount },
            { name: t('remote'), value: remoteCount },
            { name: t('inactive'), value: inactiveCount }
          ];
          const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

          return (
            <Link to={`/companies/${client.id || client._id}`} key={client.id || client._id} className={`${count === 0 ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'} p-6 rounded-2xl shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors flex items-center flex-wrap gap-2">
                    {client.name}
                    {activeCount > 0 && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                        {t('active')}: {activeCount}
                      </span>
                    )}
                    {remoteCount > 0 && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        {t('remote')}: {remoteCount}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{t('employees')}: <span className="font-semibold text-gray-700">{count}</span></p>
                </div>
                {count > 0 && (
                  <div className="w-16 h-16">
                    <PieChart width={64} height={64}>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={15} outerRadius={30} paddingAngle={0} dataKey="value" stroke="none">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
                    </PieChart>
                  </div>
                )}
              </div>
            </Link>
          );
        })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
            <p className="mb-3">{t('noClientsFound')}</p>
            {clientSearch && (
              <button 
                onClick={() => setClientSearch('')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                {t('resetSearch')}
              </button>
            )}
          </div>
        )}
      </div>

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

      {/* Print Layout */}
      {isPrinting && (
        <div className="fixed inset-0 bg-white z-[9999] p-8 overflow-auto">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-content, #printable-content * {
                visibility: visible;
              }
              #printable-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
            }
          `}</style>
          <div id="printable-content" className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end border-b-2 border-emerald-600 pb-4 mb-8">
              <div className="w-1/3">
                <img src={logo} alt="Logo" className="h-20 object-contain" />
              </div>
              <div className="w-1/3 text-center">
                <h1 className="text-2xl font-bold text-gray-800">{t('printSummary')}</h1>
                <p className="text-gray-500">{new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
              </div>
              <div className="w-1/3 text-right">
                <h2 className="text-xl font-bold text-emerald-600">شركة أسكيل أب</h2>
                <p className="text-xs font-bold tracking-widest text-gray-500">SKILLUP</p>
              </div>
            </div>

            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-right">{t('company')}</th>
                  <th className="border border-gray-300 p-3 text-center">{t('employees')}</th>
                  <th className="border border-gray-300 p-3 text-center">{t('active')}</th>
                  <th className="border border-gray-300 p-3 text-center">{t('remote')}</th>
                  <th className="border border-gray-300 p-3 text-center">{t('inactive')}</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => {
                  const count = employees.filter(e => String(e.client?.id || e.client?._id || e.client) === String(client.id || client._id)).length;
                  const activeCount = employees.filter(e => String(e.client?.id || e.client?._id || e.client) === String(client.id || client._id) && e.status === 'active').length;
                  const remoteCount = employees.filter(e => String(e.client?.id || e.client?._id || e.client) === String(client.id || client._id) && e.status === 'remote').length;
                  const inactiveCount = count - activeCount - remoteCount;
                  
                  if (count === 0) return null; // Optional: hide empty companies

                  return (
                    <tr key={client.id || client._id}>
                      <td className="border border-gray-300 p-3 font-bold">{client.name}</td>
                      <td className="border border-gray-300 p-3 text-center">{count}</td>
                      <td className="border border-gray-300 p-3 text-center text-green-600">{activeCount}</td>
                      <td className="border border-gray-300 p-3 text-center text-blue-600">{remoteCount}</td>
                      <td className="border border-gray-300 p-3 text-center text-gray-500">{inactiveCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-8 text-center text-xs text-gray-500 border-t pt-4">
              تم استخراج هذا التقرير آلياً من نظام إدارة الموارد البشرية
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;