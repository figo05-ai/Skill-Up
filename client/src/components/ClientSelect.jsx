import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../api/axios'; // استخدام الـ instance المعد مسبقاً

const ClientSelect = ({ value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/clients');
      const clientOptions = data.map(client => ({
        value: client.id || client._id,
        label: client.name
      }));
      setOptions(clientOptions);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
    setIsLoading(false);
  };

  const handleCreate = async (inputValue) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/clients', { name: inputValue });
      const newOption = { value: data.id || data._id, label: data.name };
      setOptions((prev) => [...prev, newOption]);
      onChange(newOption); // اختيار العميل الجديد تلقائياً
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
    }
    setIsLoading(false);
  };

  // إذا كنت تريد استخدام CreatableSelect لإضافة عملاء جدد مباشرة، استبدل Select بـ CreatableSelect من 'react-select/creatable'
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Client (Company)</label>
      <Select
        options={options}
        isLoading={isLoading}
        value={options.find(c => c.value === value) || null}
        onChange={(option) => onChange(option ? option.value : null)}
        placeholder="Select a client..."
        isClearable
        menuPortalTarget={document.body}
        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  );
};

export default ClientSelect;