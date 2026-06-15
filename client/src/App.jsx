import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeProfile from './pages/EmployeeProfile';
import ClientList from './pages/ClientList';
import AttendanceReport from './pages/AttendanceReport';
import TaskReport from './pages/TaskReport';
import EmployeePerformance from './pages/EmployeePerformance';
import DetailedAttendance from './pages/DetailedAttendance';
import CompanyDetails from './pages/CompanyDetails';
import RemoteWorkers from './pages/RemoteWorkers';
import Settings from './pages/Settings';
import DevTools from './pages/DevTools';
import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/client" element={<Navigate to="/login" replace />} />
          
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeProfile />} />
            <Route path="/companies/:id" element={<CompanyDetails />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/reports" element={<AttendanceReport />} />
            <Route path="/task-reports" element={<TaskReport />} />
            <Route path="/employee-performance" element={<EmployeePerformance />} />
            <Route path="/detailed-attendance" element={<DetailedAttendance />} />
            <Route path="/remote-workers" element={<RemoteWorkers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dev" element={<DevTools />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;