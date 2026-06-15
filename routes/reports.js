const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// محاولة استيراد المودلز بطرق مختلفة لضمان العمل
let Client, Employee, Attendance, Task;
try { Client = require('../models/Client'); } catch (e) {}
if (!Client || !Client.findByPk) {
  try { Client = require('../models').Client; } catch (e) {}
}
try { Employee = require('../models/User'); } catch (e) {}
try { Attendance = require('../models/Attendance'); } catch (e) {}
try { Task = require('../models/Task'); } catch (e) {}

// التأكد من تحميل المودلز الضرورية
if (!Employee) try { Employee = require('../models').User; } catch(e) {}

// محاولة استيراد مكتبة PDF
let pdf;
try { pdf = require('html-pdf'); } catch (e) {}

// دالة مساعدة لتوليد ملف PDF
const generateReportPdf = async (reportType, clientId, year, month) => {
    if (!pdf) {
      throw new Error('مكتبة "html-pdf" غير مثبتة. الرجاء تشغيل "npm install html-pdf phantomjs-prebuilt" في مجلد السيرفر.');
    }

    if (!Client || typeof Client.findByPk !== 'function') {
      throw new Error('خطأ في السيرفر: لم يتم تحميل موديل Client بشكل صحيح. تأكد من وجود الملف server/models/Client.js');
    }

    // 1. هنا يمكنك جلب بيانات العميل والتقرير من قاعدة البيانات
    const client = await Client.findByPk(clientId);
    if (!client) throw new Error('الشركة غير موجودة');

    // 2. جلب البيانات وتجهيز التقرير (HTML)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // جلب الموظفين
    const employees = await Employee.findAll({ 
      where: { 
        clientId,
        status: { [Op.ne]: 'inactive' }
      },
      attributes: ['id', 'name', 'jobTitle', 'identityNumber', 'absentDays'],
      raw: true
    });
    const empIds = employees.map(e => e.id);

    // تحسين الأداء: جلب جميع البيانات دفعة واحدة بدلاً من الاستعلام داخل الحلقة
    let allTasks = [];
    let allAttendance = [];

    if (reportType === 'tasks') {
      allTasks = await Task.findAll({
        where: { assignedTo: { [Op.in]: empIds }, createdAt: { [Op.between]: [startDate, endDate] } },
        attributes: ['id', 'title', 'createdAt', 'status', 'progressPercentage', 'assignedTo'],
        order: [['createdAt', 'ASC']],
        raw: true
      });
    } else {
      // تحديد اسم عمود المستخدم (Sequelize/MySQL support)
      let userCol = 'userRef';
      if (Attendance.rawAttributes) {
        if (Attendance.rawAttributes.userRef) userCol = 'userRef';
        else if (Attendance.rawAttributes.UserId) userCol = 'UserId';
        else if (Attendance.rawAttributes.user_id) userCol = 'user_id';
        else if (Attendance.rawAttributes.userId) userCol = 'userId';
      }

      allAttendance = await Attendance.findAll({
        where: { [userCol]: { [Op.in]: empIds }, date: { [Op.between]: [startDate, endDate] } },
        attributes: ['id', 'date', 'checkIn', 'checkOut', 'workHours', [userCol, 'userRef']],
        order: [['date', 'ASC']],
        raw: true
      });
    }
    
    // قراءة اللوجو وتحويله لـ Base64 لإدراجه في التقرير
    let logoBase64 = '';
    try {
      // محاولة العثور على مسار اللوجو بشكل أكثر دقة
      let logoPath = path.resolve(__dirname, '../../client/src/assets/logo.jpeg');
      if (!fs.existsSync(logoPath)) {
         // محاولة بديلة باستخدام process.cwd() في حال اختلاف مسار التشغيل
         logoPath = path.join(process.cwd(), 'client/src/assets/logo.jpeg');
      }

      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = `data:image/jpeg;base64,${logoData.toString('base64')}`;
      }
    } catch (e) {
      console.warn('Could not load logo for PDF', e.message);
    }

    let reportPagesHtml = '';

    // تحديد عنوان التقرير بناءً على النوع (تم نقله هنا ليكون متاحاً للترويسة)
    let reportTitle = 'تقرير';
    if (reportType === 'tasks') reportTitle = 'تقرير مهام الموظف';
    else if (reportType === 'performance') reportTitle = 'تقرير أداء الموظف';
    else if (reportType === 'detailed_attendance') reportTitle = 'تقرير الحضور التفصيلي';
    else reportTitle = 'تقرير حضور الموظفين';

    // إضافة صفحة الغلاف (Cover Page)
    reportPagesHtml += `
      <div style="page-break-after: always; font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif; direction: rtl; height: 100%; position: relative;">
        <div style="text-align: center; padding-top: 50px;">
           ${logoBase64 ? `<img src="${logoBase64}" style="height: 120px;" />` : ''}
           <h1 style="color: #059669; margin: 20px 0 5px; font-size: 40px; font-weight: 900;">شركة أسكيل أب</h1>
           <p style="margin: 0; font-size: 18px; font-weight: bold; color: #6b7280; letter-spacing: 3px;">SKILLUP</p>
        </div>
        
        <div style="text-align: center; margin-top: 80px;">
           <div style="border-top: 2px solid #059669; width: 60%; margin: 0 auto 30px;"></div>
           <h2 style="margin: 0 0 20px; font-size: 32px; font-weight: bold; color: #000;">${reportTitle}</h2>
           <h3 style="margin: 10px 0; font-size: 26px; color: #333;">${client.name}</h3>
           <p style="margin: 20px 0; font-size: 20px; color: #666;">الفترة: ${month}/${year}</p>
           <div style="border-bottom: 2px solid #059669; width: 60%; margin: 30px auto 0;"></div>
        </div>
      </div>
    `;

    for (const emp of employees) {
      let contentHtml = '';
      let summaryHtml = '';
      
      if (reportType === 'tasks') {
        // تصفية المهام للموظف الحالي من البيانات المجلوبة مسبقاً
        // استخدام String() لضمان المطابقة سواء كانت الأرقام نصوصاً أو أرقاماً
        const tasks = allTasks.filter(t => String(t.assignedTo) === String(emp.id));
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0;

        summaryHtml = `
          <table style="width: 100%; margin-bottom: 20px; border: 1px solid #000; border-collapse: collapse;">
            <tr style="background-color: #f0f0f0;">
              <td style="padding: 10px; border: 1px solid #000; text-align: center;">إجمالي المهام: <strong>${totalTasks}</strong></td>
              <td style="padding: 10px; border: 1px solid #000; text-align: center;">المكتملة: <strong>${completedTasks}</strong></td>
              <td style="padding: 10px; border: 1px solid #000; text-align: center;">نسبة الإنجاز: <strong>${progress}%</strong></td>
            </tr>
          </table>
        `;

        const rows = tasks.map((t, idx) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; border: 1px solid #000;">${t.title}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${new Date(t.createdAt).toLocaleDateString('en-GB')}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${t.status === 'completed' ? 'مكتملة' : 'جارية'}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${t.progressPercentage}%</td>
          </tr>
        `).join('');

        contentHtml = `
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #000;">
            <tr style="background-color: #e0e0e0;">
              <th style="padding: 10px; border: 1px solid #000; width: 5%;">م</th>
              <th style="padding: 10px; border: 1px solid #000; width: 40%;">اسم المهمة</th>
              <th style="padding: 10px; border: 1px solid #000; width: 15%;">التاريخ</th>
              <th style="padding: 10px; border: 1px solid #000; width: 15%;">الحالة</th>
              <th style="padding: 10px; border: 1px solid #000; width: 10%;">الإنجاز</th>
            </tr>
            ${rows || '<tr><td colspan="5" style="padding: 10px; text-align: center;">لا توجد مهام</td></tr>'}
          </table>
        `;

      } else {
        // تقارير الحضور والأداء
        // تصفية الحضور للموظف الحالي
        const atts = allAttendance.filter(a => String(a.userRef) === String(emp.id));
        
        const totalDays = atts.length;
        const totalHoursSum = atts.reduce((acc, a) => acc + (a.workHours || 0), 0);
        const deduction = (Number(emp.absentDays) || 0) * 8;
        const totalHours = Math.max(0, totalHoursSum - deduction).toFixed(2);

        summaryHtml = `
          <table style="width: 100%; margin-bottom: 20px; border: 1px solid #000; border-collapse: collapse;">
            <tr style="background-color: #f0f0f0;">
              <td style="padding: 10px; border: 1px solid #000; text-align: center;">أيام العمل: <strong>${totalDays}</strong></td>
              <td style="padding: 10px; border: 1px solid #000; text-align: center;">ساعات العمل: <strong>${totalHours}</strong></td>
            </tr>
          </table>
        `;

        const rows = atts.map((a, idx) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${new Date(a.date).toLocaleDateString('en-GB')}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${new Date(a.checkIn).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${a.checkOut ? new Date(a.checkOut).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${a.workHours}</td>
          </tr>
        `).join('');

        contentHtml = `
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #000;">
            <tr style="background-color: #e0e0e0;">
              <th style="padding: 10px; border: 1px solid #000;">م</th>
              <th style="padding: 10px; border: 1px solid #000;">التاريخ</th>
              <th style="padding: 10px; border: 1px solid #000;">دخول</th>
              <th style="padding: 10px; border: 1px solid #000;">خروج</th>
              <th style="padding: 10px; border: 1px solid #000;">ساعات</th>
            </tr>
            ${rows || '<tr><td colspan="5" style="padding: 10px; text-align: center;">لا يوجد حضور</td></tr>'}
          </table>
        `;
      }
      
      // إضافة صفحة لكل موظف
      reportPagesHtml += `
        <div style="page-break-after: always; font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif; direction: rtl;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
            body { font-family: 'Cairo', sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 8px; border: 1px solid #000; }
          </style>
          
          <div style="margin-bottom: 20px; font-size: 12px; border: 1px solid #000; padding: 10px; background-color: #f9f9f9;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 40%;"><strong>الموظف:</strong> ${emp.name}</td>
                <td style="width: 30%;"><strong>المسمى الوظيفي:</strong> ${emp.jobTitle || '-'}</td>
                <td style="width: 30%;"><strong>رقم الهوية:</strong> ${emp.identityNumber || '-'}</td>
              </tr>
            </table>
          </div>

          ${summaryHtml}
          ${contentHtml}
          
          <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #999;">
            تم استخراج هذا التقرير آلياً من نظام إدارة الموارد البشرية
          </div>
        </div>
      `;
    }

    // إنشاء ملف PDF
    const pdfOptions = { 
        format: 'A4', 
        orientation: 'portrait', 
        border: {
            top: "15mm",
            right: "15mm",
            bottom: "25mm",
            left: "15mm"
        },
        footer: {
            height: "20mm",
            contents: {
              default: `
                <div style="font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif; text-align: center; font-size: 10px; color: #4b5563; font-weight: bold; width: 100%; padding: 0 15mm; box-sizing: border-box;">
                  <div style="border-top: 2px solid #059669; margin-bottom: 8px; width: 100%;"></div>
                  <div style="direction: rtl; margin-bottom: 2px;">المملكة العربية السعودية – الرياض – ترخيص رقم (7041409280) هاتف (+966-555876997)</div>
                  <div style="direction: ltr;">Kingdom of Saudi Arabia – Riyadh – License No (7041409280) ,Tel (+966-555876997)</div>
                  <div style="margin-top: 4px; font-size: 8px; color: #999;">Page {{page}} of {{pages}}</div>
                </div>
              `
            }
        }
    };
    
    // نستخدم Promise لانتظار إنشاء الـ PDF
    const pdfBuffer = await new Promise((resolve, reject) => {
      pdf.create(reportPagesHtml, pdfOptions).toBuffer((err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });

    return { buffer: pdfBuffer, client };
};

// POST /api/reports/print
// مسار جديد لعرض التقرير مباشرة (طباعة) بدلاً من إرساله بالبريد
router.post('/print', async (req, res) => {
  const { reportType, clientId, year, month } = req.body;
  try {
    const { buffer } = await generateReportPdf(reportType, clientId, year, month);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': `inline; filename="report_${month}_${year}.pdf"`
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'فشل توليد التقرير: ' + error.message });
  }
});

// POST /api/reports/send-email
router.post('/send-email', async (req, res) => {
  const { reportType, clientId, year, month, senderEmail, senderPassword } = req.body;

  try {
    // استخدام البيانات المرسلة أو الافتراضية من السيرفر
    const emailUser = (senderEmail || process.env.EMAIL_USER || '').trim();
    // إزالة المسافات من كلمة المرور لأن جوجل يعرضها بمسافات (xxxx xxxx xxxx xxxx)
    const emailPass = (senderPassword || process.env.EMAIL_PASS || '').replace(/\s+/g, '');

    if (!emailUser || !emailPass) {
      throw new Error('بيانات البريد الإلكتروني للمرسل غير متوفرة. يرجى إدخالها أو ضبطها في السيرفر.');
    }

    // توليد التقرير
    const { buffer: pdfBuffer, client } = await generateReportPdf(reportType, clientId, year, month);

    if (!client.email) return res.status(400).json({ message: 'لا يوجد بريد إلكتروني مسجل لهذه الشركة' });

    // 2. إعداد محتوى الإيميل
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const mailOptions = {
      from: emailUser,
      to: client.email,
      subject: `التقرير الشهري: ${reportType} - ${month}/${year}`,
      text: `مرفق طيه التقرير الشهري (${reportType === 'tasks' ? 'مهام' : 'حضور'}) لشهر ${month}/${year}.`,
      attachments: [
        {
          filename: `Report_${month}_${year}.pdf`,
          content: pdfBuffer
        }
      ]
    };

    // 3. إرسال الإيميل
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'تم إرسال التقرير بنجاح' });
  } catch (error) {
    console.error('Error sending email:', error);
    
    let msg = 'فشل إرسال البريد الإلكتروني: ' + error.message;
    if (error.responseCode === 535 || (error.response && error.response.includes('535'))) {
      msg = 'فشل المصادقة: بعد تفعيل التحقق بخطوتين، يجب الدخول إلى "كلمات مرور التطبيقات" (App Passwords) في إعدادات جوجل، إنشاء كلمة مرور جديدة، واستخدام هذا الرمز المكون من 16 حرفاً بدلاً من كلمة مرورك الأصلية.';
    }

    res.status(500).json({ message: msg });
  }
});

module.exports = router;
