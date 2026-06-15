import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const StatusColumn = ({ title, tasks, onUpdate }) => (
  <div className="bg-gray-50 rounded p-4 flex-1">
    <h3 className="font-semibold mb-3">{title} ({tasks.length})</h3>
    <div className="space-y-3">
      {tasks.map((t) => (
        <div key={t.id || t._id} className="bg-white p-3 rounded shadow-sm">
          <div className="font-medium">{t.title}</div>
          <div className="text-xs text-gray-500">{t.assignedTo?.name || 'Unassigned'}</div>
          <div className="mt-2 flex gap-2">
            <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded" onClick={() => onUpdate(t.id || t._id, { status: 'in-progress' })}>Start</button>
            <button className="px-2 py-1 text-xs bg-green-500 text-white rounded" onClick={() => onUpdate(t.id || t._id, { status: 'completed', progressPercentage: 100 })}>Complete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (id, patch) => {
    try {
      await api.put(`/tasks/${id}`, patch);
      fetchTasks();
    } catch (err) { console.error('update error', err); }
  };

  const byStatus = (s) => tasks.filter(t => t.status === s);

  return (
    <div className="flex gap-4">
      <StatusColumn title="To Do" tasks={byStatus('todo')} onUpdate={handleUpdate} />
      <StatusColumn title="In Progress" tasks={byStatus('in-progress')} onUpdate={handleUpdate} />
      <StatusColumn title="Completed" tasks={byStatus('completed')} onUpdate={handleUpdate} />
    </div>
  );
};

export default TaskBoard;