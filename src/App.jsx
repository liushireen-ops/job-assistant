import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AddJobPage from './pages/AddJobPage';
import JobDetailPage from './pages/JobDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/add" element={<AddJobPage />} />
              <Route path="/job/:id" element={<JobDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ConfigProvider>
  );
}
