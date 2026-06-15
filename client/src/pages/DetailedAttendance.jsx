import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  format,
  parseISO,
  addDays,
  isAfter,
  isValid,
} from "date-fns";
import ClientSelect from "../components/ClientSelect";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import logo from "../assets/logo.jpeg";

const DetailedAttendance = () => {
  const { t, language } = useLanguage();
  const [clientId, setClientId] = useState(null);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(0);
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  const [employees, setEmployees] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState({});
  const [clientName, setClientName] = useState("");

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
      const lastDay = new Date(y, m, 0).getDate();
      const mStr = String(m).padStart(2, "0");
      setStartDate(`${y}-${mStr}-01`);
      setEndDate(`${y}-${mStr}-${lastDay}`);
    }
  };

  // Fetch client name
  useEffect(() => {
    if (!clientId) return;
    const fetchClientName = async () => {
      try {
        const res = await api.get("/clients");
        const client = res.data.find((c) => (c.id || c._id) === clientId);
        if (client) setClientName(client.name);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClientName();
  }, [clientId]);

  const handleGetEmployees = async () => {
    if (!clientId) {
      alert(t("selectClientFirst"));
      return;
    }
    try {
      const res = await api.get("/employees");
      const allEmployees = res.data || [];
      const filteredEmployees = allEmployees.filter((e) => {
        const eClientId = e.client?.id || e.client?._id || e.client;
        return (
          String(eClientId) === String(clientId) && e.status !== "inactive"
        );
      });
      setEmployees(filteredEmployees);
      setSelectedEmpIds({});
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      if (err.message === "Network Error") {
        alert(t("networkError"));
      } else {
        alert(t("errorFetchingEmployees"));
      }
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedEmpIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = {};
      employees.forEach((e) => (all[e.id || e._id] = true));
      setSelectedEmpIds(all);
    } else {
      setSelectedEmpIds({});
    }
  };

  const handlePrint = async () => {
    const idsToPrint = Object.keys(selectedEmpIds).filter(
      (id) => selectedEmpIds[id],
    );
    if (idsToPrint.length === 0) {
      alert(t("selectOneEmployee"));
      return;
    }

    try {
      api
        .post("/auth/log", {
          action: "PRINT_REPORT",
          details: `Detailed Attendance - Client: ${clientName}, Date: ${startDate} to ${endDate}`,
        })
        .catch(() => {});
      
      let allAttendance = [];
      let hasErrors = false;
      const seenIds = new Set();

      let currentStart = parseISO(startDate);
      const finalEnd = parseISO(endDate);

      while (!isAfter(currentStart, finalEnd)) {
        let chunkEnd = addDays(currentStart, 45);
        if (isAfter(chunkEnd, finalEnd)) chunkEnd = finalEnd;

        const chunkStartStr = format(currentStart, "yyyy-MM-dd");
        const chunkEndStr = format(chunkEnd, "yyyy-MM-dd");

        try {
          let attRes;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              attRes = await api.get("/attendance/history", {
                params: { startDate: chunkStartStr, endDate: chunkEndStr, limit: 5000, all: true },
              });
              break;
            } catch (err) {
              if (attempt === 2) throw err;
              const delay = err.response?.status === 429 ? 2000 : 500;
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }

          const data = attRes?.data ? (Array.isArray(attRes.data) ? attRes.data : (attRes.data.data || [])) : [];
          data.forEach((item) => {
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

      const employeesData = [];

      for (const id of idsToPrint) {
        const emp = employees.find((e) => String(e.id || e._id) === String(id));

        const empRecords = allAttendance.filter(a => String(a.userRef || a.user?.id || a.user?._id) === String(id));

        // دالة مساعدة لجمع الساعات بنظام الدقائق
        const sumHours = (recs) => {
          const totalMinutes = recs.reduce((acc, r) => {
            const val = Number(r.workHours) || 0;
            const h = Math.floor(val);
            const m = Math.round((val - h) * 60);
            return acc + h * 60 + m;
          }, 0);
          return totalMinutes / 60; // Return decimal for consistency
        };

        // Group by Month
        const monthsMap = {};
        empRecords.forEach((rec) => {
          const d = new Date(rec.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (!monthsMap[key]) monthsMap[key] = [];
          monthsMap[key].push(rec);
        });

        const months = Object.keys(monthsMap).sort().map((key) => {
          const recs = monthsMap[key].sort((a, b) => new Date(a.date) - new Date(b.date));
          return {
            key,
            records: recs,
            totalDays: recs.length,
            totalHours: sumHours(recs),
          };
        });

        employeesData.push({
          ...emp,
          months,
          totalDays: empRecords.length,
          totalHours: sumHours(empRecords),
        });
      }

      setPrintData({
        clientName,
        employees: employeesData,
        startDate,
        endDate,
      });
      setIsPrinting(true);
    } catch (err) {
      console.error(err);
      alert(t("errorPreparingReport"));
    }
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintData(null);
      setIsPrinting(false);
    };
    if (isPrinting && printData) {
      const timer = setTimeout(() => {
        window.addEventListener("afterprint", handleAfterPrint, { once: true });
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [isPrinting, printData]);

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
      <h1 className="text-2xl font-bold mb-6">{t("detailedAttendance")}</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleGetEmployees}
          className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
        >
          {t("getEmployee")}
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {t("print")}
        </button>
        <button
          onClick={() => setShowHeaderFooter(!showHeaderFooter)}
          className={`px-6 py-2 rounded font-bold transition-colors ${showHeaderFooter ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          {showHeaderFooter
            ? language === "ar"
              ? "إخفاء الهيدر والفوتر"
              : "Hide Header & Footer"
            : language === "ar"
              ? "إظهار الهيدر والفوتر"
              : "Show Header & Footer"}
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
              <label className="block text-sm font-medium mb-1">
                {t("year")}
              </label>
              <input
                type="number"
                value={year}
                onChange={handleYearChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("month")}
              </label>
              <select
                value={month}
                onChange={handleMonthChange}
                className="w-full border p-2 rounded"
              >
                <option value={0}>{t("allMonths")}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString(
                      language === "ar" ? "ar-EG" : "en-US",
                      { month: "long" },
                    )}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("start_date")}
                </label>
                <input
                  type="date"
                  lang="en-GB"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <div className="text-xs text-gray-500 mt-1 dir-ltr text-right">
                  {startDate && isValid(parseISO(startDate)) ? format(parseISO(startDate), 'dd/MM/yyyy') : ''}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("end_date")}
                </label>
                <input
                  type="date"
                  lang="en-GB"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <div className="text-xs text-gray-500 mt-1 dir-ltr text-right">
                  {endDate && isValid(parseISO(endDate)) ? format(parseISO(endDate), 'dd/MM/yyyy') : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 border-r">{t("no")}</th>
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
              <th className="p-3 border-r">{t("employee")}</th>
              <th className="p-3 border-r">{t("identity")}</th>
              <th className="p-3 border-r">{t("jobTitle")}</th>
              <th className="p-3 text-center">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp, index) => (
                <tr
                  key={emp.id || emp._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 border-r">{startIndex + index + 1}</td>
                  <td className="p-3 border-r text-center">
                    <input
                      type="checkbox"
                      checked={!!selectedEmpIds[emp.id || emp._id]}
                      onChange={() => handleCheckboxChange(emp.id || emp._id)}
                    />
                  </td>
                  <td className="p-3 border-r">{emp.name}</td>
                  <td className="p-3 border-r">{emp.identityNumber || "-"}</td>
                  <td className="p-3 border-r">{emp.jobTitle || "-"}</td>
                  <td className="p-3 text-center">
                    <Link
                      to={`/employees/${emp.id || emp._id}`}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-red-600 font-bold text-lg"
                >
                  {t("noEmployeesFound")}
                </td>
              </tr>
            )}
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
          {showHeaderFooter && (
            <div className="print-footer-fixed text-center px-10 pb-5 text-[10px] text-gray-600">
              <div className="border-t-2 border-emerald-600 mb-2"></div>
              <p dir="rtl">
                المملكة العربية السعودية – الرياض – ترخيص رقم (7041409280)
                هاتف (+966-555876997)
              </p>
              <p dir="ltr">
                Kingdom of Saudi Arabia – Riyadh – License No (7041409280)
                ,Tel (+966-555876997)
              </p>
            </div>
          )}

          {printData.employees.flatMap((emp) => 
            emp.months.map((monthData) => (
            <div key={`${emp.id || emp._id}-${monthData.key}`} className="page-break" dir={language === "ar" ? "rtl" : "ltr"}>
              {/* Header repeated for each page/month */}
              {showHeaderFooter && (
                <div className="px-10 pt-4 pb-1">
                  <div className="border-t-2 border-emerald-600 mb-2"></div>
                  <header className="mb-4 relative">
                    <div className="flex justify-between items-end pb-2 border-b-2 border-emerald-600">
                      <div className="w-1/3">
                        <img
                          src={logo}
                          alt="Logo"
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                      <div className="w-1/3 text-right">
                        <h2 className="text-2xl font-extrabold text-emerald-600">
                          شركة أسكيل أب
                        </h2>
                        <p className="text-gray-500 font-bold tracking-widest text-xs">
                          SKILLUP
                        </p>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <h1 className="text-lg font-bold">
                        {t("printTitleDetailedAttendance")}
                      </h1>
                      <h2 className="text-base text-gray-600">
                        {printData.clientName}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {t("from")}: {format(new Date(printData.startDate), 'dd/MM/yyyy')} - {t("to")}:{" "}
                        {format(new Date(printData.endDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </header>
                </div>
              )}

              {/* Content */}
              <div className="px-10">
                          <div className="mb-2 border border-black p-1 rounded bg-gray-50">
                            <div className="flex flex-wrap justify-between gap-4 text-sm font-bold">
                              <p className="min-w-[30%]">{t("worker")}: <span className="font-normal">{emp.name}</span></p>
                              <p className="min-w-[30%]">{t("jobTitle")}: <span className="font-normal">{emp.jobTitle || "-"}</span></p>
                              <p className="min-w-[30%]">{t("identity")}: <span className="font-normal">{emp.identityNumber || "-"}</span></p>
                            </div>
                          </div>
                          <h4 className="font-bold text-md mb-2 bg-gray-200 p-1 border border-black border-b-0">{monthData.key}</h4>
                          <table className="w-full border-collapse text-center text-[10px] border border-black mb-2">
                            <thead>
                              <tr className="bg-gray-100 border-b border-black">
                                <th className="border border-black p-0.5 w-8">
                                  {t("no")}
                                </th>
                                <th className="border border-black p-0.5">
                                  {t("employee")}
                                </th>
                                <th className="border border-black p-0.5">
                                  {t("identity")}
                                </th>
                                <th className="border border-black p-0.5">
                                  {t("jobTitle")}
                                </th>
                                <th className="border border-black p-0.5">
                                  {t("date")}
                                </th>
                                <th className="border border-black p-0.5">
                                  {t("checkIn")}
                                </th>
                                <th className="border border-black p-0.5">
                                  {t("checkOut")}
                                </th>
                                <th className="border border-black p-0.5">
                                  {t("workHours")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {monthData.records.map((rec, idx) => (
                                <tr key={`${rec.id || rec._id}-${idx}`}>
                                  <td className="border border-black p-0.5">
                                    {idx + 1}
                                  </td>
                                  <td className="border border-black p-0.5">
                                    {emp.name}
                                  </td>
                                  <td className="border border-black p-0.5">
                                    {emp.identityNumber || "-"}
                                  </td>
                                  <td className="border border-black p-0.5">
                                    {emp.jobTitle || "-"}
                                  </td>
                                  <td className="border border-black p-0.5">
                                    {rec.date
                                      ? format(new Date(rec.date), "dd/MM/yyyy")
                                      : "-"}
                                  </td>
                                  <td className="border border-black p-0.5">
                                    {rec.checkIn
                                      ? format(new Date(rec.checkIn), "hh:mm a")
                                      : "-"}
                                  </td>
                                  <td className="border border-black p-0.5">
                                    {rec.checkOut
                                      ? format(new Date(rec.checkOut), "hh:mm a")
                                      : "-"}
                                  </td>
                                  <td className="border border-black p-0.5">
                                    {(() => {
                                      const val = Number(rec.workHours) || 0;
                                      let h = Math.floor(val);
                                      let m = Math.round((val - h) * 60);
                                      if (m === 60) { h += 1; m = 0; }
                                      return `${h}:${m < 10 ? '0' : ''}${m}`;
                                    })()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="border border-black p-1 bg-gray-50 font-bold text-xs flex justify-around">
                            <span>{t("totalWorkDays")}: {monthData.totalDays}</span>
                            <span>{t("totalWorkHours")}: {(() => {
                              const val = monthData.totalHours;
                              let h = Math.floor(val);
                              let m = Math.round((val - h) * 60);
                              if (m === 60) { h += 1; m = 0; }
                              return `${h}:${m < 10 ? '0' : ''}${m}`;
                            })()}</span>
                          </div>
              </div>
              
              {/* Spacer for fixed footer */}
              {showHeaderFooter && <div className="h-[80px]"></div>}
            </div>
          )))}
        </div>
      )}
    </div>
  );
};

export default DetailedAttendance;
