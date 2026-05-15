import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">管理</h3>
        <Link
          to="/flow-list"
          className={`sidebar-link ${location.pathname === '/flow-list' ? 'active' : ''}`}
        >
          <span className="sidebar-icon">📋</span>
          工作流列表
        </Link>
        <Link
          to="/admin"
          className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}
        >
          <span className="sidebar-icon">🧩</span>
          结点列表
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
