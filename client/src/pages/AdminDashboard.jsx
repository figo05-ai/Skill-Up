import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981'];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [taskDist, setTaskDist] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setSummary(res.data);

        // create a simple distribution from tasks
        const tasks = await api.get('/tasks');
        const dist = tasks.data.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {});
        setTaskDist(Object.entries(dist).map(([name, value]) => ({ name, value })));
      } catch (err) {
        console.error('Dashboard fetch error', err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        {summary ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Total Employees</div>
              <div className="text-2xl font-bold">{summary.totalEmployees}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Tasks Completed</div>
              <div className="text-2xl font-bold">{summary.tasksCompleted}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Avg Progress</div>
              <div className="text-2xl font-bold">{summary.avgProgress}%</div>
            </div>

            <div className="col-span-2 mt-4">
              <h3 className="text-lg mb-2">Task Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={taskDist}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Productivity</h2>
        {taskDist.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={taskDist} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
                {taskDist.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div>No data</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;