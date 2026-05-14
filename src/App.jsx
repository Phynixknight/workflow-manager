import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import FlowListPage from './pages/FlowListPage';
import FlowEditorPage from './pages/FlowEditorPage';
import './App.css';

function AppLayout() {
  const location = useLocation();
  const isFlowEditor = location.pathname === '/flow-editor';

  if (isFlowEditor) {
    return (
      <div className="app app-fullscreen">
        <Routes>
          <Route path="/flow-editor" element={<FlowEditorPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app">
      <Navigation />
      <div className="app-body">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/flow-list" element={<FlowListPage />} />
            <Route path="/flow-editor" element={<FlowEditorPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
