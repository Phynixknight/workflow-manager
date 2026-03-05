import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-title-link">
          <h1 className="nav-title">工作流管理系统</h1>
        </Link>
        <div className="nav-links">
          <Link 
            to="/admin" 
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            节点列表
          </Link>
          <Link 
            to="/flow-list" 
            className={`nav-link ${location.pathname === '/flow-list' ? 'active' : ''}`}
          >
            流程图列表
          </Link>
          <Link 
            to="/flow-editor" 
            className={`nav-link ${location.pathname === '/flow-editor' ? 'active' : ''}`}
          >
            流程图编辑器
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;