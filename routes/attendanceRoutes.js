const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  history,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");
const { Op } = require("sequelize");

// Direct imports for reliability
const Employee = require("../models/User");
const AttendanceModel = require("../models/Attendance");
const SystemLog = require("../models/SystemLog");

// دالة مساعدة لتحديد اسم حقل المستخدم في المودل
const getUserField = (Model) => {
  if (!Model) return "userRef";
  // Sequelize
  if (Model.rawAttributes) {
    const keys = Object.keys(Model.rawAttributes);
    if (keys.includes("userRef")) return "userRef";
    if (keys.includes("UserId")) return "UserId";
    if (keys.includes("user_id")) return "user_id";
    if (keys.includes("userId")) return "userId";
    if (keys.includes("employeeId")) return "employeeId";
  }
  // Mongoose
  if (Model.schema && Model.schema.paths) {
    if (Model.schema.paths.userRef) return "userRef";
    if (Model.schema.paths.userId) return "userId";
    if (Model.schema.paths.employeeId) return "employeeId";
  }
  return "userRef"; // الافتراضي
};

router.post("/checkin", protect, checkIn);
router.post("/checkout", protect, checkOut);
router.get("/history", protect, history);

// مسار حذف البيانات (نطاق زمني)
router.delete("/range", protect, async (req, res) => {
  const { startDate, endDate, clientId, employeeId } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Missing dates" });
  }

  try {
    if (!AttendanceModel) throw new Error("AttendanceModel not loaded");

    let deletedCount = 0;
    const userCol = getUserField(AttendanceModel);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const where = {
      date: {
        [Op.between]: [start, end],
      },
    };

    if (employeeId && employeeId !== "null" && employeeId !== "undefined") {
      where[userCol] = employeeId;
    } else if (clientId && clientId !== "null" && clientId !== "undefined") {
      const employees = await Employee.findAll({
        where: { client: clientId },
        attributes: ["id"],
      });
      const empIds = employees.map((e) => e.id);
      if (empIds.length === 0) {
        return res.json({
          count: 0,
          message: "No employees found for this client",
        });
      }
      where[userCol] = { [Op.in]: empIds };
    }

    deletedCount = await AttendanceModel.destroy({ where });

    // تسجيل العملية في السجل (Log)
    if (SystemLog) {
      await SystemLog.create({
        action: "BULK_DELETE_ATTENDANCE",
        details: `Deleted ${deletedCount} records. Range: ${startDate} to ${endDate}`,
        performedBy: req.user
          ? `${req.user.name} (${req.user.email})`
          : "Unknown",
        userId: req.user ? req.user.id : null,
      }).catch(() => {});
    }

    res.json({
      count: deletedCount,
      message: `Deleted ${deletedCount} records`,
    });
  } catch (error) {
    console.error("Delete Range Error:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

// مسار توليد البيانات (تم نقله هنا لضمان عمله)
router.post("/seed", protect, async (req, res) => {
  const { startDate, endDate, employeeId, clientId } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Missing dates" });
  }

  try {
    let employees = [];
    if (employeeId && employeeId !== "null" && employeeId !== "undefined") {
      const emp = await Employee.findByPk(employeeId);
      if (emp) employees.push(emp);
    } else if (clientId) {
      employees = await Employee.findAll({ where: { client: clientId } });
    } else {
      employees = await Employee.findAll();
    }

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    // تحديد اسم العمود (userRef أو userId)
    const userCol = getUserField(AttendanceModel);

    // جلب السجلات الموجودة مسبقاً في الفترة المحددة لتجنب التكرار
    const empIds = employees.map((e) => e.id);
    const queryStart = new Date(startDate);
    queryStart.setHours(0, 0, 0, 0);
    const queryEnd = new Date(endDate);
    queryEnd.setHours(23, 59, 59, 999);

    const existingRecords = await AttendanceModel.findAll({
      where: {
        [userCol]: { [Op.in]: empIds },
        date: { [Op.between]: [queryStart, queryEnd] },
      },
      attributes: [userCol, "date"],
      raw: true,
    });

    // إنشاء Set للبحث السريع: "userId-YYYY-MM-DD"
    const existingSet = new Set();
    existingRecords.forEach((r) => {
      let d = r.date;
      if (!(d instanceof Date)) d = new Date(d);
      if (!isNaN(d)) {
        const dStr = d.toISOString().split("T")[0];
        existingSet.add(`${r[userCol]}-${dStr}`);
      }
    });

    let current = new Date(startDate);
    const end = new Date(endDate);
    const records = [];

    while (current <= end) {
      const day = current.getDay();
      // تخطي الجمعة (5) والسبت (6)
      if (day !== 5 && day !== 6) {
        const dateStr = current.toISOString().split("T")[0];

        for (const emp of employees) {
          // تخطي إذا كان للموظف سجل حضور موجود بالفعل في هذا اليوم
          if (existingSet.has(`${emp.id}-${dateStr}`)) continue;

          // 1. استخدام نسبة الحضور الخاصة بالموظف (الافتراضي 100%)
          let attendanceRate = 100;
          if (
            emp.attendancePercentage !== undefined &&
            emp.attendancePercentage !== null
          ) {
            const parsed = parseFloat(emp.attendancePercentage);
            if (!isNaN(parsed)) attendanceRate = parsed;
          }

          // التعديل: الموظف يحضر كل الأيام، ولكن ساعات العمل تتأثر بالنسبة
          // if (Math.random() * 100 <= attendanceRate) { // تم إلغاء شرط تخطي الأيام

          // 2. حساب ساعات العمل اليومية بناءً على الساعات الشهرية وأيام العطلات
          let monthlyHours = 176;
          if (emp.monthlyWorkHours) {
            const parsed = parseFloat(emp.monthlyWorkHours);
            if (!isNaN(parsed) && parsed > 0) monthlyHours = parsed;
          }

          // حساب عدد أيام العمل الفعلية في الشهر الحالي (باستثناء الجمعة والسبت)
          // لضمان توزيع ساعات العمل الشهرية (مثلاً 176) على الأيام المتاحة فعلياً
          let actualWorkingDays = 0;
          const tempDate = new Date(
            current.getFullYear(),
            current.getMonth(),
            1,
          );
          while (tempDate.getMonth() === current.getMonth()) {
            const d = tempDate.getDay();
            if (d !== 5 && d !== 6) actualWorkingDays++;
            tempDate.setDate(tempDate.getDate() + 1);
          }

          const targetDailyHours =
            monthlyHours / (actualWorkingDays > 0 ? actualWorkingDays : 1);

          // توليد وقت دخول عشوائي يبدأ من 9:00 صباحاً بتوقيت السعودية (+3 UTC)
          const startHour = 9 + Math.random() * 0.5;
          const utcStartHour = startHour - 3; // التحويل إلى UTC

          const checkInDate = new Date(Date.UTC(
            current.getFullYear(),
            current.getMonth(),
            current.getDate(),
            Math.floor(utcStartHour),
            Math.floor((utcStartHour % 1) * 60),
            0
          ));

          // حساب وقت الخروج: حوالي 17:00 (5 مساءً) مع تباين بسيط
          const endHour = 17 + Math.random() * 0.5;
          let actualDuration = endHour - startHour;
          
          // تطبيق نسبة الحضور على ساعات العمل
          actualDuration = actualDuration * (attendanceRate / 100);

          // التأكد من أن ساعات العمل لا تقل عن حد أدنى (مثلاً ساعة)
          if (actualDuration < 1) actualDuration = 1;

          const checkOutDate = new Date(
            checkInDate.getTime() + actualDuration * 60 * 60 * 1000,
          );

          // تصحيح: تخزين الساعات كرقم عشري مباشر (Decimal Hours) بدلاً من صيغة HH.MM
          // هذا يضمن توافقها مع طريقة الحساب في التقارير
          const workHours = parseFloat(actualDuration.toFixed(2));

          records.push({
            [userCol]: emp.id,
            date: dateStr,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            workHours: workHours,
            status: "present",
          });
          // } // إغلاق الشرط الملغى
        }
      }
      current.setDate(current.getDate() + 1);
    }

    if (records.length > 0) {
      // تقسيم الإدخال إلى دفعات لتجنب مشاكل الذاكرة مع الفترات الطويلة
      const chunkSize = 500;
      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);

        try {
          await AttendanceModel.bulkCreate(chunk, { ignoreDuplicates: true });
        } catch (e) {
          console.error("Bulk create failed, trying individual", e.message);
          for (const rec of chunk) {
            try {
              await AttendanceModel.create(rec);
            } catch (e) {}
          }
        }
      }
    }

    if (SystemLog) {
      await SystemLog.create({
        action: "SEED_ATTENDANCE",
        details: `Generated ${records.length} records. Range: ${startDate} to ${endDate}`,
        performedBy: req.user
          ? `${req.user.name} (${req.user.email})`
          : "Unknown",
        userId: req.user ? req.user.id : null,
        ipAddress: req.ip,
      }).catch(() => {});
    }

    res.json({ message: `تم توليد ${records.length} سجل حضور بنجاح.` });
  } catch (error) {
    console.error("Seed Error:", error);
    res
      .status(500)
      .json({ message: "فشلت عملية التوليد", error: error.message });
  }
});

module.exports = router;
