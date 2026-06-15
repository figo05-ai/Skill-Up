import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

const ClientList = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    id: null,
    name: "",
    personalId: "",
    email: "",
    phone: "",
    address: "",
    commercialRecord: "",
    laborOfficeNumber: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setError(null);
      const [resClients, resEmps] = await Promise.all([
        api.get("/clients"),
        api.get("/employees"),
      ]);
      setClients(resClients.data);
      setEmployees(resEmps.data);
    } catch (err) {
      console.error(err);
      setError(t("networkError"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        alert(t("invalidEmail"));
        return;
      }
    }

    if (form.phone && form.phone.length !== 10) {
      alert(`${t("companyPhone")}: ${t("mustBe10Digits")}`);
      return;
    }

    if (form.personalId && form.personalId.length !== 10) {
      alert(`${t("personalId")}: ${t("mustBe10Digits")}`);
      return;
    }
    if (form.commercialRecord && form.commercialRecord.length !== 10) {
      alert(`${t("commercialRecord")}: ${t("mustBe10Digits")}`);
      return;
    }
    if (form.laborOfficeNumber && form.laborOfficeNumber.length !== 10) {
      alert(`${t("laborOfficeNumber")}: ${t("mustBe10Digits")}`);
      return;
    }

    try {
      if (form.id) {
        await api.put(`/clients/${form.id}`, form);
      } else {
        await api.post("/clients", form);
      }
      setForm({
        id: null,
        name: "",
        email: "",
        phone: "",
        address: "",
        personalId: "",
        commercialRecord: "",
        laborOfficeNumber: "",
      });
      setShowModal(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        (form.id ? t("errorUpdatingClient") : t("errorAddingClient"));
      alert(errorMsg);
    }
  };

  const handleEdit = (client) => {
    setForm({
      id: client.id || client._id,
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      personalId: client.personalId || "",
      commercialRecord: client.commercialRecord || "",
      laborOfficeNumber: client.laborOfficeNumber || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDeleteCompany"))) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (err) {
      console.error(err);
      alert(t("errorDeletingClient"));
    }
  };

  const openAddModal = () => {
    setForm({
      id: null,
      name: "",
      email: "",
      phone: "",
      address: "",
      personalId: "",
      commercialRecord: "",
      laborOfficeNumber: "",
    });
    setShowModal(true);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {t("clientManagement")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">{t("clientListDesc")}</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-bold flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {t("addClient")}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 text-center">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8 relative">
        <input
          type="text"
          placeholder={t("searchClientPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* قائمة الشركات (شكل جدول) */}
      <div className="bg-white shadow-sm border border-gray-300">
        <table className="w-full text-start border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200 border-b border-gray-300 text-gray-800 font-bold whitespace-nowrap">
              <th className="px-3 py-2 border border-gray-300">
                {t("clientName")}
              </th>
              <th className="px-3 py-2 border border-gray-300">
                {t("companyEmail")}
              </th>
              <th className="px-3 py-2 border border-gray-300">
                {t("companyPhone")}
              </th>
              <th className="px-3 py-2 border border-gray-300 text-center bg-gray-300">
                {t("employees")}
              </th>
              <th className="px-3 py-2 border border-gray-300 text-center text-green-800 bg-green-200">
                {t("active")}
              </th>
              <th className="px-3 py-2 border border-gray-300 text-center text-blue-800 bg-blue-200">
                {t("remote")}
              </th>
              <th className="px-3 py-2 border border-gray-300 text-center text-red-800 bg-red-200">
                {t("inactive")}
              </th>
              <th className="px-3 py-2 border border-gray-300">
                {t("companyAddress")}
              </th>
              <th className="px-3 py-2 border border-gray-300">
                {t("personalId")}
              </th>
              <th className="px-3 py-2 border border-gray-300">
                {t("commercialRecord")}
              </th>
              <th className="px-3 py-2 border border-gray-300">
                {t("laborOfficeNumber")}
              </th>
              <th className="px-3 py-2 border border-gray-300 text-center">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const clientEmps = employees.filter((e) => {
                  const eClientId = e.client?.id || e.client?._id || e.client;
                  return String(eClientId) === String(client.id || client._id);
                });
                const totalCount = clientEmps.length;
                const activeCount = clientEmps.filter(
                  (e) => e.status === "active",
                ).length;
                const remoteCount = clientEmps.filter(
                  (e) => e.status === "remote",
                ).length;
                const inactiveCount = totalCount - activeCount - remoteCount;

                return (
                  <tr
                    key={client.id || client._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2 border border-gray-300 font-bold text-gray-800">
                      <Link
                        to={`/companies/${client.id || client._id}`}
                        className="text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-2"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-gray-600">
                      {client.email || "-"}
                    </td>
                    <td
                      className="px-3 py-2 border border-gray-300 text-gray-600 whitespace-nowrap"
                      dir="ltr"
                    >
                      {client.phone ? (
                        <a
                          href={`tel:${client.phone}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {client.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-center font-bold text-gray-800 bg-gray-50">
                      {totalCount}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-center font-bold text-green-700 bg-green-50">
                      {activeCount}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-center font-bold text-blue-700 bg-blue-50">
                      {remoteCount}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-center font-bold text-red-600 bg-red-50">
                      {inactiveCount}
                    </td>
                    <td
                      className="px-3 py-2 border border-gray-300 text-gray-600 leading-tight"
                      title={client.address}
                    >
                      {client.address || "-"}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-gray-600 font-mono text-xs whitespace-nowrap">
                      {client.personalId || "-"}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-gray-600 font-mono text-xs whitespace-nowrap">
                      {client.commercialRecord || "-"}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-gray-600 font-mono text-xs whitespace-nowrap">
                      {client.laborOfficeNumber || "-"}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEdit(client);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title={t("edit")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(client.id || client._id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title={t("delete")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="12"
                  className="p-8 text-center text-gray-500 text-lg"
                >
                  {t("noClientsFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {form.id ? t("editCompany") : t("addClient")}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  {t("clientName")} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  {t("companyEmail")}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  {t("companyPhone")}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  {t("companyAddress")}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  {t("personalId")}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  value={form.personalId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      personalId: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  {t("commercialRecord")}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  value={form.commercialRecord}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      commercialRecord: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  {t("laborOfficeNumber")}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  value={form.laborOfficeNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      laborOfficeNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  maxLength={10}
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-bold"
                >
                  {form.id ? t("saveChanges") : t("saveAndAdd")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
