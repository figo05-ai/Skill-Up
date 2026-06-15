import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  
  const [name, setName] = useState(user?.name || '');
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [userLogs, setUserLogs] = useState([]);
  const [selectedLogUser, setSelectedLogUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const canDeleteUsers = ['Alama@gmail.com', 'admin@example.com'].includes(user?.email);
  const canViewEmails = ['Alama@gmail.com', 'admin@example.com'].includes(user?.email);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/auth/users');
      // إخفاء حساب admin@example.com تماماً
      setUsersList(Array.isArray(res.data) ? res.data.filter(u => u.email !== 'admin@example.com') : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      let msg = t('errorFetchingUsers');
      if (err.message === 'Network Error' && !err.response) {
        msg = t('networkError');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response) {
        msg = `${t('errorFetchingUsers')} (Code: ${err.response.status})`;
      }
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchUsers();
  }, [user?.role]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // يفترض وجود endpoint لتحديث البيانات
      await api.put('/auth/updatedetails', { name }); 
      setMessage({ type: 'success', text: t('successUpdate') });
      if (updateUser) updateUser({ name });
    } catch (err) {
      console.error(err);
      let msg = 'Error updating profile';
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.data?.errors) msg = err.response.data.errors.map(e => e.msg).join(', ');
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: t('passwordsDoNotMatch') });
      return;
    }
    try {
      // يفترض وجود endpoint لتحديث كلمة المرور
      await api.put('/auth/updatepassword', { 
        currentPassword: passwordData.current,
        newPassword: passwordData.new 
      });
      setMessage({ type: 'success', text: t('successUpdate') });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error(err);
      let msg = 'Error updating password';
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.data?.errors) msg = err.response.data.errors.map(e => e.msg).join(', ');
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setMessage({ type: 'error', text: t('invalidEmail') });
      return;
    }

    if (usersList.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      setMessage({ type: 'error', text: t('emailDuplicate') });
      return;
    }

    try {
      // يفترض وجود endpoint لإنشاء مستخدم جديد (تسجيل)
      await api.post('/auth/register', newUser); 
      setMessage({ type: 'success', text: t('successCreate') });
      setNewUser({ name: '', email: '', password: '', role: 'admin' });
      fetchUsers(); // تحديث القائمة بعد الإضافة
    } catch (err) {
      console.error(err);
      let msg = 'Error creating user';
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.data?.errors) msg = err.response.data.errors.map(e => e.msg).join(', ');
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm(t('confirmDeleteUser'))) return;
    try {
      await api.delete(`/auth/users/${id}`);
      setMessage({ type: 'success', text: t('successUpdate') });
      fetchUsers();
    } catch (err) {
      console.error(err);
      let msg = t('errorDeletingUser');
      if (err.message === 'Network Error' && !err.response) {
        msg = t('networkError');
      } else if (err.response?.data?.message) msg = err.response.data.message;
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedUsers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = {};
      const currentUserId = user._id || user.id;
      usersList.forEach(u => {
        // عدم تحديد الحساب الحالي
        if ((u._id || u.id) !== currentUserId) {
          all[u._id || u.id] = true;
        }
      });
      setSelectedUsers(all);
    } else {
      setSelectedUsers({});
    }
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selectedUsers).filter(k => selectedUsers[k]);
    if (ids.length === 0) return;
    if (!window.confirm(t('confirmDeleteUser'))) return;
    try {
      await Promise.all(ids.map(id => api.delete(`/auth/users/${id}`)));
      setMessage({ type: 'success', text: t('successUpdate') });
      setSelectedUsers({});
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: t('errorDeletingUser') });
    }
  };

  const handleViewLogs = async (targetUser) => {
    setSelectedLogUser(targetUser);
    setShowLogsModal(true);
    setUserLogs([]);
    try {
      const res = await api.get(`/auth/users/${targetUser._id || targetUser.id}/logs`);
      setUserLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportLogs = () => {
    if (!userLogs || userLogs.length === 0) return;
    
    const data = userLogs.map(log => ({
      [t('action')]: log.action,
      [t('details')]: log.details,
      [t('date')]: new Date(log.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");
    XLSX.writeFile(wb, `Logs_${selectedLogUser?.name || 'User'}.xlsx`);
  };

  const handleEditUser = (targetUser) => {
    setEditingUser(targetUser);
    setEditForm({
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      password: '' // كلمة المرور فارغة افتراضياً
    });
  };

  const handleSaveUserChanges = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password; // لا ترسل كلمة المرور إذا كانت فارغة
      
      await api.put(`/employees/${editingUser._id || editingUser.id}`, payload);
      setMessage({ type: 'success', text: t('successUpdate') });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      let msg = 'Error updating user';
      if (err.response?.data?.message) msg = err.response.data.message;
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    if ((targetUser._id || targetUser.id) === (user._id || user.id)) {
      setMessage({ type: 'error', text: t('cannotDisableSelf') });
      return;
    }

    const newStatus = !targetUser.allowLogin;
    try {
      await api.put(`/employees/${targetUser._id || targetUser.id}`, { allowLogin: newStatus });
      setMessage({ type: 'success', text: t('successUpdate') });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error updating user status' });
    }
  };

  const filteredUsers = usersList.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* إعدادات الملف الشخصي */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">{t('profileSettings')}</h2>
          
          <form onSubmit={handleUpdateProfile} className="mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">{t('name')}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-bold">
              {t('updateProfile')}
            </button>
          </form>

          <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('changePassword')}</h3>
          <form onSubmit={handleChangePassword}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700">{t('currentPassword')}</label>
              <input type="password" value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700">{t('newPassword')}</label>
              <input type="password" value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">{t('confirmNewPassword')}</label>
              <input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
            </div>
            <button type="submit" className="bg-gray-800 text-white px-6 py-2.5 rounded-xl hover:bg-gray-900 transition-all shadow-lg font-bold">
              {t('changePassword')}
            </button>
          </form>
        </div>

        {/* إنشاء مستخدم جديد (للمدير فقط) */}
        {user?.role === 'admin' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">{t('createNewUser')}</h2>
            <form onSubmit={handleCreateUser}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('name')}</label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('email')}</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('password')}</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('role')}</label>
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                  <option value="system_user">{t('user')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 font-bold">
                {t('createUser')}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* قائمة المستخدمين (للمدير فقط) */}
      {user?.role === 'admin' && (
        <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-2 gap-4">
            <h2 className="text-xl font-bold text-gray-800">{t('usersList')}</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'بحث (الاسم، الايميل، الصلاحية)...' : 'Search (Name, Email, Role)...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
              />
              <button onClick={fetchUsers} className="p-2 hover:bg-gray-50 rounded-full transition-colors" title={t('refresh')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          {loadingUsers ? (
            <div className="text-center py-8 text-gray-500">{t('loading')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                    <th className="p-4 border-r w-12 text-center">
                      {canDeleteUsers && <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={usersList.length > 0 && usersList.every(u => {
                          const uId = u._id || u.id;
                          const currentUserId = user._id || user.id;
                          return uId === currentUserId || selectedUsers[uId];
                        })}
                      />}
                    </th>
                    <th className="p-4 border-r">{t('name')}</th>
                    <th className="p-4 border-r">{t('email')}</th>
                    <th className="p-4 border-r">{t('role')}</th>
                    <th className="p-4 text-center">
                      {Object.values(selectedUsers).filter(Boolean).length > 0 ? (
                        <button onClick={handleBulkDelete} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors">
                          {t('delete')} ({Object.values(selectedUsers).filter(Boolean).length})
                        </button>
                      ) : (
                        t('actions')
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <tr key={u._id || u.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${!u.allowLogin ? 'bg-red-50' : ''}`}>
                      <td className="p-4 border-r border-gray-50 text-center">
                        {/* إخفاء مربع الاختيار للحساب الحالي */}
                        {((u._id || u.id) !== (user._id || user.id)) && canDeleteUsers && (
                          <input 
                            type="checkbox" 
                            checked={!!selectedUsers[u._id || u.id]} 
                            onChange={() => handleCheckboxChange(u._id || u.id)} 
                          />
                        )}
                      </td>
                      <td className="p-4 border-r border-gray-50 font-medium text-gray-800">{u.name}</td>
                      <td className="p-4 border-r border-gray-50 text-gray-600">{canViewEmails ? u.email : '***'}</td>
                      <td className="p-4 border-r border-gray-50"><span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{t(u.role)}</span></td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button 
                          onClick={() => handleToggleUserStatus(u)} 
                          className={`p-2 rounded-lg transition-colors ${u.allowLogin ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={u.allowLogin ? t('disable') : t('enable')}
                        >
                          {u.allowLogin ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                          )}
                        </button>
                        <button onClick={() => handleEditUser(u)} className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50" title={t('edit')}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => handleViewLogs(u)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50" title={t('viewLogs')}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {/* إخفاء زر الحذف للحساب الحالي */}
                        {((u._id || u.id) !== (user._id || user.id)) && canDeleteUsers && (
                          <button onClick={() => handleDeleteUser(u._id || u.id)} className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50" title={t('delete')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">{t('noData')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{t('edit')} {t('user')}</h2>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveUserChanges} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('name')}</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('email')}</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('role')}</label>
                <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                  <option value="system_user">{t('user')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">{t('password')}</label>
                <input type="password" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} placeholder={t('senderPasswordHint')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">{t('close')}</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200">{t('saveChanges')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">
                {t('userOperations')}: <span className="text-emerald-600">{selectedLogUser?.name}</span>
              </h2>
              <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {userLogs.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-4 border-b text-sm font-semibold text-gray-600">{t('action')}</th>
                      <th className="p-4 border-b text-sm font-semibold text-gray-600">{t('details')}</th>
                      <th className="p-4 border-b text-sm font-semibold text-gray-600">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLogs.map(log => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm font-medium text-gray-800">{log.action}</td>
                        <td className="p-4 text-sm text-gray-600">{log.details}</td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">{t('noData')}</div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-2">
              {userLogs.length > 0 && (
                <button onClick={handleExportLogs} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  {t('exportExcel')}
                </button>
              )}
              <button onClick={() => setShowLogsModal(false)} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;