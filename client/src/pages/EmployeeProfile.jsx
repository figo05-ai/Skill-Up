import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmployee(res.data);
        const t = await api.get('/tasks');
        // استخدام == للمقارنة المرنة بين الأرقام والنصوص، ودعم id و _id
        const myTasks = t.data.filter(x => 
          (x.assignedTo?.id || x.assignedTo?._id || x.assignedTo) == id
        );
        setTasks(myTasks);
      } catch (err) { console.error(err); }
    };
    if (id) load();
  }, [id]);

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">{employee.name}</h2>
        <div className="text-sm text-gray-600">{user?.role === 'admin' ? employee.email : '***'}</div>
        <div className="mt-4">
          <div className="text-sm text-gray-500">Contract Number</div>
          <div className="font-medium">{employee.contractNumber || '-'}</div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-500">Status</div>
          <div className="font-medium">{employee.status}</div>
        </div>
      </div>

      <div className="md:col-span-2 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Active Tasks</h3>
        <ul className="space-y-2">
          {tasks.map(t => (
            <li key={t.id || t._id} className="p-3 border rounded">{t.title} - {t.status} - {t.progressPercentage}%</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmployeeProfile;